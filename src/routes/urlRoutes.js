const express = require("express");
const router = express.Router();
const urlController = require("../controllers/urlController");
const { protect } = require("../middleware/authMiddleware");
const { generalLimiter } = require("../middleware/rateLimiter");


router.post("/shortener", protect, generalLimiter, urlController.createShortUrl);
router.get("/shortener/me", protect, urlController.getMyUrls);
router.get("/:code", urlController.redirectToOriginal);
router.get("/shortener/analytics/:code", protect, urlController.getClickAnalytics);

module.exports = router;
