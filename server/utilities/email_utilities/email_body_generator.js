const _ = require('lodash');
const logger = require('../logger.js');
const { Joi } = require('celebrate');
const generateDigestBody = require('./generate_digest_body.js');
const generateIndividualBodies = require('./generate_individual_bodies.js');
const EMAIL_MODE_INDIVIDUAL = 'individual';
const EMAIL_MODE_DIGEST = 'digest';
const SCHEMA_LABEL = 'the collection of users and the links they should receive today';
const SCHEMA_userObjectArray = Joi.array().items(
	Joi.object().required().label(SCHEMA_LABEL).keys({
		targetEmail: Joi.string().email().required(),
		linkCollection: Joi.array().required(),
		emailMode: Joi.string().required()
	})
);

var returnLCOArrayWithEmailBodies = function(userObjectArray) {
	return new Promise((resolve, reject) => {
		function returnUsersWithBodies(users) {
			_.each(users, function(user) {
				user.emailBodyCollection = []
				if (user.emailMode == EMAIL_MODE_DIGEST) {
					user.emailBodyCollection.push(generateDigestBody(user.linkCollection));
				} else if (user.emailMode == EMAIL_MODE_INDIVIDUAL) {
					user.emailBodyCollection = generateIndividualBodies(user.linkCollection);
				}
			});
			resolve(users);
		}

		Joi.validate(userObjectArray, SCHEMA_userObjectArray)
			.then(users => returnUsersWithBodies(users))
			.catch((reason) => {
				logger.error("userObjectArray schema was invalid as passed to returnLCOArrayWithEmailBodies: ", { error: reason });
				reject([]);
			});



	});

}




const emailBodyGenerator = {
	buildLMLEmailBodyCollection: returnLCOArrayWithEmailBodies
}

module.exports = emailBodyGenerator;