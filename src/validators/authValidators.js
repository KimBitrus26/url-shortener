const Joi = require("joi");


const userSignupValidation = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    "any.required": "Name is required",
    "string.empty": "Name cannot be empty"
    }),
  email: Joi.string().email().required().messages({
    "any.required": "Email is required",
    "string.email": "Invalid email format",
    "string.empty": "Email cannot be empty"
  }),
  password: Joi.string().min(6).required(),
  countryCode: Joi.string()
    .pattern(/^\+?\d{1,4}$/)
    .required()
    .messages({
        "string.pattern.base": "countryCode must be numeric and can start with +",
        "any.required": "Country code is required",
        "string.empty": "Country code cannot be empty"
    }),
  phone: Joi.string()
    .pattern(/^\d{5,18}$/)
    .required()
    .messages({
      "string.pattern.base": "phone must contain only digits and be 5-18 characters",
      "any.required": "Phone number code is required",
      "string.empty": "Phone number cannot be empty"
    }),
});

const forgotPasswordEmailValidation = Joi.object({
  email: Joi.string().email().required().messages({
    "any.required": "Email is required",
    "string.email": "Invalid email format",
    "string.empty": "Email cannot be empty"
  }),
});

const resetPasswordValidation = Joi.object({
  token: Joi.string().required(),
  newPassword: Joi.string().min(6).required(),
}); 


const loginValidation = Joi.object({
  email: Joi.string().email().required().messages({
    "any.required": "Email is required",
    "string.email": "Invalid email format",
    "string.empty": "Email cannot be empty"
  }),
  password: Joi.string().min(6).required(),
});

module.exports = { 
    userSignupValidation,
    forgotPasswordEmailValidation,
    resetPasswordValidation,
    loginValidation,
 };
