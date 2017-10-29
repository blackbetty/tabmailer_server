const { Joi } = require('celebrate');

const user_activation_GET_schema = Joi.object().keys({
    userHash: Joi.string().token().required()
});

module.exports = user_activation_GET_schema;