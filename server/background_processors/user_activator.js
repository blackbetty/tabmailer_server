var mail_sender = require('./mail_sender.js');
require('dotenv').config();
const os = require('os');
var datastore_interface = require('../utilities/datastore_interface');
var logger = require('../utilities/logger');
var user_activator = {

	sendUserActivationEmail: function (entity) {

		var hash = entity.user_hash;
		var activation_url = process.env.DOMAIN + '/activateUser/' + hash;

		var email_body = 'please visit the following link to activate your account: ' + activation_url;
		var email_subject = 'TabMailer Activation';
		logger.info('Sending user activation email to: ' + entity.user_name);
		mail_sender.sendEmail(entity.user_email, email_subject, email_body);
	},

	activateUser: function (userHash, cb) {
		datastore_interface('users').returning('*').where('user_hash', userHash).update(
			{
				user_activated: true
			}
		)
			.then((rows) => {
				const entity = rows[0];
				if (!entity) {
					var err = 'No user found';
					cb(err, null);
				} else {
					cb(null, entity);
				}

			})
			.catch((error) => {
				logger.error('Unknown Error In User Activation', error)
				cb(error, null);
			});
		// datastore_interface.fetchUserForPropertyAndValue('user_hash', userHash, function (optionalUserEntities) {
		// 	var err = '';
		// 	if (!optionalUserEntities[0]) {
		// 		err = 'No user found';
		// 		cb(err, null);
		// 		return;
		// 	}
		// 	var userEntity = optionalUserEntities[0];
		// 	datastore_interface.setValueForProperty(userEntity, 'activated', true, function (endUser) {
		// 		cb(null, endUser);
		// 	});
		// });
	}
};








module.exports = user_activator;