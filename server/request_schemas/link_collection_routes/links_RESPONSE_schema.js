const {
	Joi
} = require('celebrate');

const objectSchema = Joi.object({
	link_id: Joi.string().guid().required(),
	link_url: Joi.string().uri({
		allowRelative: true
	}).required(),
	link_title: Joi.string().required(),
	link_date_created: Joi.date().required(),
	user_id: Joi.number().required()
}).required();


const links_RES_schema = Joi.array().items(objectSchema).required();
module.exports = links_RES_schema;