const urlService = require("../services/urlService");
const { createUrlSchema } = require("../validators/urlValidator");
const notificationService = require("../services/notificationService");

// Create short URL
exports.createShortUrl = async (req, res) => {
  try {
    
    const { error } = createUrlSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const { originalUrl, customAlias, expiresAt } = req.body;

    if (!originalUrl) {
      return res.status(400).json({ success: false, message: "originalUrl is required" });
    }

    const record = await urlService.createShortUrl({
      originalUrl,
      customAlias,
      expiresAt,
      userId: req.user._id,
    });

    // SANITIZE OUTPUT
    const sanitizedData = {
      originalUrl: record.originalUrl,
      shortUrl: record.shortUrl,
      shortCode: record.shortCode,
      expiresAt: record.expiresAt || null,
      clicks: record.clicks,
      isActive: record.isActive,
      createdAt: record.createdAt
    };

    res.status(201).json({
      success: true,
      message: "Short URL created successfully",
      data: sanitizedData,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Get all URLs for current user
exports.getMyUrls = async (req, res) => {
   
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await urlService.getUserUrls(req.user._id, page, limit);

    res.json({ 
        success: true, 
        message: "User URLs retrieved successfully",
         ...result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Public redirect
exports.redirectToOriginal = async (req, res) => {
  try {
    const { code } = req.params;
    if (!code) return res.status(400).send("Code is required");

    const shortUrl = await urlService.getByShortCodeOrAlias(code);
    if (!shortUrl) return res.status(404).send("Short URL not found");

    if (!shortUrl.isActive) return res.status(410).send("Short URL is disabled");

    if (shortUrl.isExpired()){
        await notificationService.createNotification(
        shortUrl.user,
        "Short URL Expired",
        `Your short URL (${shortUrl.shortUrl}) has expired.`
        );
    return res.status(410).send("Short URL expired");
    } 

    await urlService.recordClick(shortUrl, req);

    return res.redirect(shortUrl.originalUrl);
  } catch (err) {
     res.status(500).json({ success: false, message: err.message });
  }
};


// Get click analytics
exports.getClickAnalytics = async (req, res) => {
  try {
    const { code } = req.params;

    const shortUrl = await urlService.getByShortCodeOrAlias(code);
    if (!shortUrl) {
      return res.status(404).json({ success: false, message: "Short URL not found" });
    }

    // Only owner can access analytics
    if (String(shortUrl.user) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const analytics = await urlService.getAnalytics(shortUrl._id);

    res.json({
      success: true,
      message: "Analytics retrieved successfully",
      data: analytics,
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

