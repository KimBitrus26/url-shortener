const ShortUrl = require("../models/ShortUrl");
const crypto = require("crypto");
const generateRandomUrlCode = require("./utils").generateRandomUrlCode;


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

  return newUrl;
};

exports.getUserUrls = async (userId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  // Query data
  const urls = await ShortUrl.find({ user: userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  // Count documents
  const total = await ShortUrl.countDocuments({ user: userId });

  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    data: urls
  };
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
