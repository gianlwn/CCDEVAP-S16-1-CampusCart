const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Listing = require("../models/Listing");
const Claim = require("../models/Claim");
const Rating = require("../models/Rating");
const Cart = require("../models/Cart");
const createNotification = require("../utils/createNotification");
const issueWarning = require("../utils/issueWarning");
const { saveProfilePicture, deleteProfilePicture } = require("../utils/imageStorage");
const { suspendUser } = require("../utils/suspension");
const titleCase = require("../utils/titleCase");

function statusOf(user) {
  if (user.is_banned) return "banned";
  if (user.is_suspended) {
    if (user.suspended_until && user.suspended_until <= new Date())
      return "active";
    return "suspended";
  }
  return "active";
}

exports.list = async (req, res) => {
  try {
    const users = await User.find({ is_deleted: { $ne: true } }).sort({
      created_at: -1,
    });
    users.sort((a, b) => (a.role === "admin") - (b.role === "admin"));
    res.json(
      users.map((u) => ({
        user_id: u.user_id,
        username: `${u.first_name} ${u.last_name}`.trim(),
        email: u.email,
        role: u.role,
        dateJoined: u.created_at
          ? new Date(u.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "2-digit",
              year: "numeric",
            })
          : "—",
        status: statusOf(u),
        warning_count: u.warning_count || 0,
      })),
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["active", "suspended", "banned"].includes(status)) {
      return res.status(400).json({ error: "invalid_status" });
    }
    const update = {
      is_suspended: status === "suspended",
      is_banned: status === "banned",
    };
    if (status !== "suspended") update.suspended_until = null;
    if (status === "active") update.warning_count = 0;

    let updated = await User.findOneAndUpdate(
      { user_id: req.params.user_id },
      update,
      { new: true },
    );
    if (!updated) return res.status(404).json({ error: "not_found" });

    if (status === "suspended") {
      updated = await suspendUser(updated.user_id);
      await createNotification(
        updated.user_id,
        "suspension",
        "Your account has been suspended by an administrator for 3 days.",
      ).catch(() => {});
    } else if (status === "banned") {
      await createNotification(
        updated.user_id,
        "ban",
        "Your account has been banned by an administrator.",
      ).catch(() => {});
    } else if (status === "active") {
      await createNotification(
        updated.user_id,
        "reactivated",
        "Your account has been reactivated. Welcome back!",
      ).catch(() => {});
    }

    res.json({ user_id: updated.user_id, status: statusOf(updated) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
};

exports.warn = async (req, res) => {
  try {
    const { note } = req.body;
    const result = await issueWarning(req.params.user_id, note);
    if (!result) return res.status(404).json({ error: "not_found" });
    res.json({ success: true, ...result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
};

exports.getOne = async (req, res) => {
  try {
    const user = await User.findOne({ user_id: req.params.user_id });
    if (!user || user.is_deleted)
      return res.status(404).json({ error: "not_found" });

    const [itemsSold, activeListings, listings] = await Promise.all([
      Claim.countDocuments({ seller_id: user.user_id, status: "completed" }),
      Listing.countDocuments({ seller_id: user.user_id, status: "active" }),
      Listing.find({ seller_id: user.user_id }, "listings_id"),
    ]);

    const listingIds = listings.map((l) => l.listings_id);
    let avgRating = null;
    if (listingIds.length) {
      const ratings = await Rating.find({
        listing_id: { $in: listingIds },
        is_removed: false,
      });
      if (ratings.length) {
        const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
        avgRating = Math.round((sum / ratings.length) * 10) / 10;
      }
    }

    const memberSince = user.created_at
      ? new Date(user.created_at).toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        })
      : "—";

    const rawPhone = user.contact_number || "";
    let formattedPhone = rawPhone;
    if (rawPhone.length === 10 && rawPhone.startsWith("9")) {
      formattedPhone = "+63" + rawPhone;
    } 
    else if (rawPhone.length === 11 && rawPhone.startsWith("09")) {
      formattedPhone = "+63" + rawPhone.slice(1);
    }
    
    res.json({
      user_id: user.user_id,
      first_name: user.first_name,
      last_name: user.last_name,
      name: `${user.first_name} ${user.last_name}`.trim(),
      email: user.email,
      contact_number: formattedPhone,
      bio: user.bio || "",
      school: user.school || "",
      course_code: user.course_code || "",
      profile_picture: user.profile_picture,
      rating: avgRating,
      itemsSold,
      activeListings,
      memberSince,
      warning_count: user.warning_count || 0,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
};

exports.update = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      contact_number,
      bio,
      school,
      course_code,
      password,
      profile_picture,
      remove_picture,
      theme,
    } = req.body;
    const nameRegex = /^[a-zA-Z\s]+$/;
    if (first_name !== undefined && !nameRegex.test(first_name.trim())) {
      return res.status(400).json({ error: "invalid_first_name" });
    }
    if (last_name !== undefined && !nameRegex.test(last_name.trim())) {
      return res.status(400).json({ error: "invalid_last_name" });
    }
    if (theme !== undefined && !["light", "dark"].includes(theme)) {
      return res.status(400).json({ error: "invalid_theme" });
    }
    const update = {};
    if (first_name !== undefined) update.first_name = titleCase(first_name);
    if (last_name !== undefined) update.last_name = titleCase(last_name);
    if (contact_number !== undefined) update.contact_number = contact_number;
    if (bio !== undefined) update.bio = bio;
    if (school !== undefined) update.school = school;
    if (course_code !== undefined) update.course_code = course_code;
    if (theme !== undefined) update.theme = theme;
    if (password) update.password_hash = await bcrypt.hash(password, 10);

    let previousPicture = null;
    if (profile_picture) {
      const saved = saveProfilePicture(profile_picture, req.params.user_id);
      if (!saved) return res.status(400).json({ error: "invalid_image" });
      const existing = await User.findOne({ user_id: req.params.user_id });
      if (!existing) return res.status(404).json({ error: "not_found" });
      previousPicture = existing.profile_picture;
      update.profile_picture = saved;
    } else if (remove_picture) {
      const existing = await User.findOne({ user_id: req.params.user_id });
      if (!existing) return res.status(404).json({ error: "not_found" });
      previousPicture = existing.profile_picture;
      update.profile_picture = "default_pfp.jpg";
    }

    const updated = await User.findOneAndUpdate(
      { user_id: req.params.user_id },
      update,
      { new: true },
    );
    if (!updated) return res.status(404).json({ error: "not_found" });
    if (previousPicture) deleteProfilePicture(previousPicture);
    res.json({ user_id: updated.user_id, profile_picture: updated.profile_picture });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
};

exports.remove = async (req, res) => {
  try {
    const { user_id } = req.params;
    const user = await User.findOne({ user_id });
    if (!user) return res.status(404).json({ error: "not_found" });

    const listings = await Listing.find({ seller_id: user_id }, "listings_id");
    const listingIds = listings.map((l) => l.listings_id);

    await Promise.all([
      User.findOneAndUpdate({ user_id }, { is_deleted: true }),
      Listing.deleteMany({ seller_id: user_id }),
      Cart.deleteMany({ buyer_id: user_id }),
      Rating.deleteMany({ rater_id: user_id }),
      ...(listingIds.length
        ? [Rating.deleteMany({ listing_id: { $in: listingIds } })]
        : []),
    ]);

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
};
