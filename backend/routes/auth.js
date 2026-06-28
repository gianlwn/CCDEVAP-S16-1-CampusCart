const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const emailjs = require('@emailjs/nodejs');
const User = require('../models/User');
const generateId = require('../utils/generateId');

const otpStore = new Map();
const recoveryVerified = new Set();

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendOTPEmail(toEmail, otpCode) {
  await emailjs.send(
    process.env.EMAILJS_SERVICE_ID,
    process.env.EMAILJS_TEMPLATE_ID,
    {
      to_email: toEmail,
      to_name:  toEmail,
      otp_code: otpCode,
    },
    {
      publicKey:  process.env.EMAILJS_PUBLIC_KEY,
      privateKey: process.env.EMAILJS_PRIVATE_KEY,
    }
  );
}

// POST /api/auth/send-code
router.post('/send-code', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.toLowerCase().endsWith('.edu.ph')) {
      return res.status(400).json({ error: 'invalid_email' });
    }
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ error: 'email_taken' });

    const code = generateOTP();
    otpStore.set(email.toLowerCase(), { code, expiresAt: Date.now() + 10 * 60 * 1000 });

    await sendOTPEmail(email, code);

    res.json({ message: 'Code sent' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server_error' });
  }
});

// POST /api/auth/verify-code
router.post('/verify-code', (req, res) => {
  const { email, code } = req.body;
  const record = otpStore.get(email.toLowerCase());
  if (!record) return res.status(400).json({ error: 'no_code_sent' });
  if (Date.now() > record.expiresAt) {
    otpStore.delete(email.toLowerCase());
    return res.status(400).json({ error: 'code_expired' });
  }
  if (record.code !== code) return res.status(400).json({ error: 'invalid_code' });

  otpStore.delete(email.toLowerCase());
  res.json({ verified: true });
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, school, course_code, phone } = req.body;
    if (!name || !email || !password || !course_code) {
      return res.status(400).json({ error: 'missing_fields' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ error: 'email_taken' });

    const nameParts = name.trim().split(' ');
    const last_name = nameParts.length > 1 ? nameParts.pop() : '';
    const first_name = nameParts.join(' ');

    const password_hash = await bcrypt.hash(password, 10);
    const user_id = await generateId(User, 'user_id', 'user_id_');

    const user = new User({
      user_id,
      email: email.toLowerCase(),
      password_hash,
      first_name,
      last_name,
      course_code: course_code.toUpperCase(),
      school,
      phone,
      role: 'student',
    });
    await user.save();

    res.status(201).json({ message: 'Account created' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server_error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'missing_fields' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ error: 'invalid_credentials' });
    if (user.is_banned) return res.status(403).json({ error: 'account_banned' });
    if (user.is_suspended) return res.status(403).json({ error: 'account_suspended' });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: 'invalid_credentials' });

    res.json({
      user_id:    user.user_id,
      email:      user.email,
      first_name: user.first_name,
      last_name:  user.last_name,
      role:       user.role,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server_error' });
  }
});

// POST /api/auth/send-recovery
router.post('/send-recovery', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ error: 'not_found' });

    const code = generateOTP();
    otpStore.set(`rec_${email.toLowerCase()}`, { code, expiresAt: Date.now() + 10 * 60 * 1000 });

    await sendOTPEmail(email, code);

    res.json({ message: 'Recovery code sent' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server_error' });
  }
});

// POST /api/auth/verify-recovery
router.post('/verify-recovery', (req, res) => {
  const { email, code } = req.body;
  const record = otpStore.get(`rec_${email.toLowerCase()}`);
  if (!record) return res.status(400).json({ error: 'no_code_sent' });
  if (Date.now() > record.expiresAt) {
    otpStore.delete(`rec_${email.toLowerCase()}`);
    return res.status(400).json({ error: 'code_expired' });
  }
  if (record.code !== code) return res.status(400).json({ error: 'invalid_code' });

  otpStore.delete(`rec_${email.toLowerCase()}`);
  recoveryVerified.add(email.toLowerCase());
  res.json({ verified: true });
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!recoveryVerified.has(email.toLowerCase())) {
      return res.status(403).json({ error: 'not_verified' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    await User.updateOne({ email: email.toLowerCase() }, { password_hash });
    recoveryVerified.delete(email.toLowerCase());

    res.json({ message: 'Password updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server_error' });
  }
});

module.exports = router;
