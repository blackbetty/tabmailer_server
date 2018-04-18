const { Joi } = require('celebrate');

const user_creation_POST_schema = Joi.object().keys({
	emailaddress: Joi.string().email().required(),
	username: Joi.string().required(),
	credentials: Joi.string().required()
});

module.exports = user_creation_POST_schema;