const Notification = require("../models/Notification");
const { clearNotificationCache } = require("./utils");
const redis = require("../config/redis");

// Create notification (for internal use)
exports.createNotification = async (userId, title, message) => {
  const notitificatio = await Notification.create({
    user: userId,
    title,
    message,
  });

    await clearNotificationCache(userId);

  return notitificatio;

};

// Get all notifications
exports.getNotifications = async (userId, page = 1, limit = 10) => {


  const skip = (page - 1) * limit;

  const cacheKey = `notifications:${userId}:page:${page}:limit:${limit}`;
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      console.log("Cache hit for user notifications");
      return JSON.parse(cachedData);
    }
  
    // Query data
    const notifications = await Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
  
    // Count documents
    const total = await Notification.countDocuments({ user: userId });
  
    const response = {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data: notifications
    };

    // Save to cache (TTL = 10 minutes)
    const TTL_SECONDS = 600;
    await redis.set(cacheKey, JSON.stringify(response), "EX", TTL_SECONDS);

    return response;
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
    const notification = await Notification.deleteMany({ user: userId });
    await clearNotificationCache(userId);
    return notification;
};
