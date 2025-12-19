const Joi = require("joi");


const profileUpdateValidation = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    "any.required": "Name is required",
    "string.empty": "Name cannot be empty"
    }),
  
});

module.exports = { 
    
    profileUpdateValidation,
 };
