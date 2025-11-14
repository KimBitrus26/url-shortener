const Joi = require("joi");

const createUrlSchema = Joi.object({

  originalUrl: Joi.string()
    .uri({ scheme: ["http", "https"] })
    .required()
    .messages({
      "string.empty": "originalUrl is required",
      "string.uri": "originalUrl must be a valid http/https URL",
    }),

  customAlias: Joi.string()
    .alphanum() // only letters + numbers
    .min(3)
    .max(30)
    .optional()
    .messages({
      "string.alphanum": "customAlias can only contain letters and numbers",
      "string.min": "customAlias must be at least 3 characters",
      "string.max": "customAlias must not exceed 30 characters",
    }),

  expiresAt: Joi.date()
    .greater("now")               // must be in the future
    .min(new Date(Date.now() + 24 * 60 * 60 * 1000))  // +1 day
    .optional()
    .messages({
      "date.greater": "expiresAt must be a future date",
      "date.min": "expiresAt must be at least 1 day from now",
    })
});

module.exports = {
  createUrlSchema,
};
