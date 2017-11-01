const { Joi } = require('celebrate');

const settings_GET_schema = Joi.object().keys({
    google_access_token: Joi.string(),
    google_id_token: Joi.string()
}).xor('google_access_token', 'google_id_token');

module.exports = settings_GET_schema;