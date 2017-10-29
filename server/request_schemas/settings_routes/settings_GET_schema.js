const { Joi } = require('celebrate');

const settings_GET_schema = Joi.object().keys({
    google_id_token: Joi.string().required()
});

module.exports = settings_GET_schema;