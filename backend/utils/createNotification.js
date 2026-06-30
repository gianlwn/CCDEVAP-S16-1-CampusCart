const Notification = require("../models/Notification");
const generateId = require("./generateId");

async function createNotification(user_id, type, message, reference_id) {
  const notification_id = await generateId(
    Notification,
    "notification_id",
    "notif_id_",
  );
  await new Notification({
    notification_id,
    user_id,
    type,
    message,
    reference_id,
  }).save();
}

module.exports = createNotification;
