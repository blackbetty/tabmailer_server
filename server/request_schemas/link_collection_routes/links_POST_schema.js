const { Joi } = require('celebrate');

const links_POST_schema = Joi.object().keys({
    google_access_token: Joi.string(),
    google_id_token: Joi.string(),
    tab_url: Joi.string().required(),
    tab_title: Joi.string().required()
}).xor('google_access_token', 'google_id_token');

module.exports = links_POST_schema;