const { required } = require("joi");
const mongoose = require("mongoose");

const shortUrlSchema = new mongoose.Schema({
  // Original long URL
  originalUrl: {
    type: String,
    required: true,
    trim: true,
  },
  
  // Short code (e.g., "abcd1234" in https://short.ly/abcd1234)
  shortCode: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true,
  },
  
  // User who created this URL 
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    index: true,
    required: true,
  },
  
  // Custom alias (optional)
  customAlias: {
    type: String,
    trim: true,
    sparse: true, // Allows null values but ensures uniqueness when present
    unique: true,
  },
  
  // Expiration date (optional)
  expiresAt: {
    type: Date,
    default: null,
  },
  
  // Analytics
  clicks: {
    type: Number,
    default: 0,
  },
  
  // Detailed click tracking
  clickDetails: [{
    timestamp: { type: Date, default: Date.now },
    ipAddress: String,
    userAgent: String,
    referer: String,
    country: String,
    city: String,
  }],
  
 
  // Status
  isActive: {
    type: Boolean,
    default: true,
  },
  
  
}, {
  timestamps: true,
});

// Index for expiration cleanup by mongoose TTL
shortUrlSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtual for full short URL
shortUrlSchema.virtual("shortUrl").get(function() {
  const baseUrl = process.env.BASE_URL || "http://localhost:5000";
  return `${baseUrl}/${this.customAlias || this.shortCode}`;
});

// Method to check if URL is expired
shortUrlSchema.methods.isExpired = function() {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
};

// Method to increment click count
shortUrlSchema.methods.recordClick = async function(clickData) {
  this.clicks += 1;
  
  // Add to click details (limit to last 1000 clicks to prevent unbounded growth)
  this.clickDetails.push(clickData);
  if (this.clickDetails.length > 1000) {
    this.clickDetails = this.clickDetails.slice(-1000);
  }
  
  await this.save();
};

// Ensure virtuals are included in JSON
shortUrlSchema.set("toJSON", { virtuals: true });
shortUrlSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("shortUrl", shortUrlSchema);