const { Joi } = require('celebrate');

const email_POST_schema = Joi.object().keys({
    google_id_token: Joi.string().required(),
    newKey: Joi.string().required(),
    emailaddress: Joi.string().email().required()
})


module.exports = email_POST_schema;


// google_id_token\" is not allowed. \"emailaddress\" is not allowed. \"newKey\" is not allowed","validation":{"source":"body","keys":["google_id_token","emailaddress","newKey"]}}