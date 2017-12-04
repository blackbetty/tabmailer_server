const _ = require('lodash');
const logger = require('../logger.js');
const {
	Joi
} = require('celebrate');
const generateDigestBody = require('./generate_digest_body.js');
const generateIndividualBodies = require('./generate_individual_bodies.js');
const EMAIL_MODE_INDIVIDUAL = 'INDIVIDUAL';
const EMAIL_MODE_DIGEST = 'DIGEST';
const util = require('util');
const SCHEMA_LABEL = 'the collection of users and the links they should receive today';
const SCHEMA_userObjectArray = Joi.array().items(
	Joi.object().required().label(SCHEMA_LABEL).keys({
		targetEmail: Joi.string().email().required(),
		linkCollection: Joi.array().required(),
		emailMode: Joi.string().required()
	})
);

var SCHEMA_ERROR = 'an error occurred generating email bodies in returnLCOArrayWithEmailBodies: ';

var returnLCOArrayWithEmailBodies = function (userObjectArray) {
	return new Promise((resolve, reject) => {
		function returnUsersWithBodies(userObjectArray) {
			_.each(userObjectArray, function (user) {
				user.emailBodyCollection = [];

				if (user.emailMode == EMAIL_MODE_DIGEST) {
					var digestBody = generateDigestBody(user.linkCollection);
					if (digestBody != null) {
						user.emailBodyCollection.push(digestBody);
					}
				} else if (user.emailMode == EMAIL_MODE_INDIVIDUAL) {
					user.emailBodyCollection = generateIndividualBodies(user.linkCollection);
				}
			});
			resolve(userObjectArray);
		}

		Joi.validate(userObjectArray, SCHEMA_userObjectArray)
			.then(users => returnUsersWithBodies(users))
			.catch((reason) => {
				logger.silly(`-----------userObjectArray INVALID SCHEMA----------:\n\t\t ${util.inspect(userObjectArray)}\n\t\t -----------END INVALID SCHEMA----------`);
				logger.error(SCHEMA_ERROR, {
					error: reason
				});
				reject(reason);
			});



	});

};




const emailBodyGenerator = {
	buildLMLEmailBodyCollection: returnLCOArrayWithEmailBodies
};

module.exports = emailBodyGenerator;