const { Joi } = require('celebrate');

const links_GET_schema = Joi.object().keys({
    google_id_token: Joi.string().required()
});

module.exports = links_GET_schema;