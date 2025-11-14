const notificationService = require("../services/notificationService");

//  User Notification Count
exports.getNotificationCount = async (req, res) => {
  try {
    const count = await notificationService.getNotificationCount(req.user._id);
    res.json({ 
        success: true, 
        message: "Unread notification count retrieved successfully",
        data: {count: count}});
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Retrieve  user Notifications
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await notificationService.getNotifications(req.user._id);
    res.json({ 
        success: true, 
        message: "Notifications retrieved successfully",
        data: notifications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Mark Notification Read/Unread
exports.markNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const { isRead } = req.body;

    const updated = await notificationService.markNotification(
      req.user._id,
      id,
      isRead
    );

    if (!updated)
      return res.status(404).json({ 
        success: false, 
        message: "Notification not found"
     });

    res.json({ success: true, message: "Updated", data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Clear All user Notifications
exports.clearNotifications = async (req, res) => {
  try {
    await notificationService.clearNotifications(req.user._id);
    res.json({ success: true, message: "Notifications cleared" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
