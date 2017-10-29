const { Joi } = require('celebrate');

const user_creation_POST_schema = Joi.object().keys({
    google_id_token: Joi.string().required(),
    emailaddress: Joi.string().email().required(),
    username: Joi.string().required(),
    gapi_given_name: Joi.string().required(),
    gapi_user_email: Joi.string().required()
});

module.exports = user_creation_POST_schema;