const User = require("../models/User");

const SUSPENSION_DAYS = 3;

async function suspendUser(userId) {
  const suspended_until = new Date(
    Date.now() + SUSPENSION_DAYS * 24 * 60 * 60 * 1000,
  );
  return User.findOneAndUpdate(
    { user_id: userId },
    { is_suspended: true, suspended_until },
    { new: true },
  );
}

async function liftExpiredSuspension(user) {
  if (
    user.is_suspended &&
    user.suspended_until &&
    user.suspended_until <= new Date()
  ) {
    user.is_suspended = false;
    user.suspended_until = null;
    await User.findOneAndUpdate(
      { user_id: user.user_id },
      { is_suspended: false, suspended_until: null },
    );
  }
  return user;
}

module.exports = { suspendUser, liftExpiredSuspension, SUSPENSION_DAYS };
