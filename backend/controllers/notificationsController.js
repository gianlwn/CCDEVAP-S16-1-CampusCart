const Notification = require("../models/Notification");

exports.list = async (req, res) => {
  try {
    const { user_id } = req.query;
    if (!user_id) return res.status(400).json({ error: "missing_user_id" });
    const notifications = await Notification.find({ user_id })
      .sort({ created_at: -1 })
      .limit(50);
    res.json(notifications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
};

exports.readAll = async (req, res) => {
  try {
    const { user_id } = req.query;
    if (!user_id) return res.status(400).json({ error: "missing_user_id" });
    await Notification.updateMany(
      { user_id, is_read: false },
      { is_read: true },
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
};

exports.markRead = async (req, res) => {
  try {
    const updated = await Notification.findOneAndUpdate(
      { notification_id: req.params.id },
      { is_read: true },
      { new: true },
    );
    if (!updated) return res.status(404).json({ error: "not_found" });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
};
