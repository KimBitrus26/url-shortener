const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const notificationController = require("../controllers/notificationController");

router.get("/notifications", protect, notificationController.getNotifications);
router.get("/notifications/count", protect, notificationController.getNotificationCount);
router.patch("/notifications/:id/mark", protect, notificationController.markNotification);
router.delete("/notifications/clear", protect, notificationController.clearNotifications);

module.exports = router;
