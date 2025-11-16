const ShortUrl = require("../models/ShortUrl");
const crypto = require("crypto");
const generateRandomUrlCode = require("./utils").generateRandomUrlCode;
const notificationService = require("./notificationService");
const redis = require("../config/redis");
const { clearUrlCache } = require("./utils");

exports.createShortUrl = async (data) => {
  const { originalUrl, customAlias, expiresAt, userId } = data;

  let shortCode;
  // Validate custom alias uniqueness
  if (customAlias) {
    const exists = await ShortUrl.findOne({ customAlias });
    if (exists) {
        throw new Error("Custom alias is already taken");
    }
    shortCode = customAlias;
  } else {
    // generate unique code
        let isUnique = false;

        while (!isUnique) {
            shortCode = generateRandomUrlCode();
            const exists = await ShortUrl.findOne({ shortCode });
            if (!exists) isUnique = true;   
        }
  }

  const newUrl = await ShortUrl.create({
    originalUrl,
    shortCode: shortCode || customAlias,
    customAlias,
    expiresAt: expiresAt ? new Date(expiresAt) : null,
    user: userId,
  });

  await notificationService.createNotification(
        userId,
        "Short URL Created",
        `Your short URL (${newUrl.shortUrl}) has been created successfully.`
        );

    await clearUrlCache(userId);

  return newUrl;
};

exports.getUserUrls = async (userId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const cacheKey = `urls:${userId}:page:${page}:limit:${limit}`;
  const cachedData = await redis.get(cacheKey);
  if (cachedData) {
    console.log("Cache hit for user URLs");
    return JSON.parse(cachedData);
  }

  // Query data
  const urls = await ShortUrl.find({ user: userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  // Count documents
  const total = await ShortUrl.countDocuments({ user: userId });

  const response = {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    data: urls
  };

  // Save to cache (TTL = 10 minutes)
  const TTL_SECONDS = 600;
  await redis.set(cacheKey, JSON.stringify(response),  "EX", TTL_SECONDS );

  return response;
};


exports.getByShortCodeOrAlias = async (code) => {
  return await ShortUrl.findOne({
    $or: [{ shortCode: code }, { customAlias: code }],
  });
};

exports.recordClick = async (shortUrl, req) => {
  const ip = req.ip || req.connection.remoteAddress;

  const clickData = {
    ipAddress: ip,
    userAgent: req.headers["user-agent"],
    referer: req.headers["referer"] || null,
    country: req.geo?.country || null, // If behind geo proxy
    city: req.geo?.city || null,
  };

  await shortUrl.recordClick(clickData);

    // Notify user of click
   await notificationService.createNotification(
    shortUrl.user,
    "Short URL Clicked",
    `Your short URL (${shortUrl.shortUrl}) was clicked.`
  );

};


exports.getAnalytics = async (shortUrlId) => {
  const url = await ShortUrl.findById(shortUrlId);

  if (!url) return null;

  return {
    originalUrl: url.originalUrl,
    shortCode: url.shortCode,
    customAlias: url.customAlias,
    shortUrl: url.shortUrl,
    totalClicks: url.clicks,
    isActive: url.isActive,
    isExpired: url.isExpired(),
    createdAt: url.createdAt,
    lastUpdated: url.updatedAt,
    clickDetails: url.clickDetails,
  };
};
