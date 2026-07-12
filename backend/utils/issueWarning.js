const User = require("../models/User");
const createNotification = require("./createNotification");
const { suspendUser } = require("./suspension");

async function issueWarning(userId, note, referenceId) {
  const updatedUser = await User.findOneAndUpdate(
    { user_id: userId },
    { $inc: { warning_count: 1 } },
    { new: true },
  );
  if (!updatedUser) return null;

  await createNotification(
    userId,
    "warning",
    note
      ? `You have received a warning: ${note}`
      : "You have received a warning for violating our platform policies.",
    referenceId,
  ).catch(() => {});

  let autoSuspended = false;
  if (
    updatedUser.warning_count >= 3 &&
    !updatedUser.is_suspended &&
    !updatedUser.is_banned
  ) {
    autoSuspended = true;
    await suspendUser(userId);
    await createNotification(
      userId,
      "suspension",
      "Your account has been automatically suspended for 3 days after receiving 3 warnings.",
      referenceId,
    ).catch(() => {});
  }

  return {
    warning_count: updatedUser.warning_count,
    is_suspended: autoSuspended ? true : updatedUser.is_suspended,
    is_banned: updatedUser.is_banned,
    autoSuspended,
  };
}

module.exports = issueWarning;
