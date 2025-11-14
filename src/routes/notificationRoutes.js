const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const notificationController = require("../controllers/notificationController");


router.get("/count", protect, notificationController.getNotificationCount);
router.get("/", protect, notificationController.getNotifications);
router.patch("/:id/mark", protect, notificationController.markNotification);
router.delete("/clear", protect, notificationController.clearNotifications);

module.exports = router;
