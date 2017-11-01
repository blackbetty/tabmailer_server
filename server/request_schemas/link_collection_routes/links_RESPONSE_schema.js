const { Joi } = require('celebrate');

const links_RES_schema = Joi.object().keys({
    activated: Joi.boolean().required(),
    article_list: Joi.array().required(),
    date_user_created: Joi.number().integer().required(),
    emailaddress: Joi.string().email().required(),
    google_user_id: Joi.string().required(),
    settings: Joi.object().required(),
    settingsChanged: Joi.boolean().required(),
    user_hash: Joi.string().alphanum().required(),
    username: Joi.string().token().required()
});

module.exports = links_RES_schema;