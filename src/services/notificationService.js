const Notification = require("../models/Notification");

// Create notification (for internal use)
exports.createNotification = async (userId, title, message) => {
  return await Notification.create({
    user: userId,
    title,
    message,
  });
};

// Get all notifications
exports.getNotifications = async (userId) => {
  return await Notification.find({ user: userId }).sort({ createdAt: -1 });
};

// Get unread count
exports.getNotificationCount = async (userId) => {
  return await Notification.countDocuments({ user: userId, isRead: false });
};

// Mark single notification read/unread
exports.markNotification = async (userId, notificationId, readState) => {
  return await Notification.findOneAndUpdate(
    { _id: notificationId, user: userId },
    { isRead: readState },
    { new: true }
  );
};

// Clear ALL notifications for user
exports.clearNotifications = async (userId) => {
  return await Notification.deleteMany({ user: userId });
};
