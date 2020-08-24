//Validation using hapi/joi
const Joi = require("@hapi/joi");

const  validateRegistration = data => {
    const schema = Joi.object({
        name: Joi.string().min(6).required(),
        email: Joi.string().min(6).required().email(),
        password: Joi.string().min(6).required(),
        realPassword: Joi.string()
    })
    return schema.validate(data);
}

const validateLogin = data =>{
    const schema = Joi.object({
        email: Joi.string().min(6).required().email(),
        password: Joi.string().min(6).required()
    })
    return schema.validate(data);
}

module.exports.validateRegistration = validateRegistration;
module.exports.validateLogin = validateLogin;