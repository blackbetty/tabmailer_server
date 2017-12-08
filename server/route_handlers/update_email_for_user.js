const datastore_interface = require('../utilities/datastore_interface.js');
const user_activator = require('../background_processors/user_activator.js');
var hash = require('object-hash');
var logger = require('../utilities/logger.js');


module.exports = function (googleUserID, newEmail, callback) {

	datastore_interface.transaction(function (trx) {
		trx('users').update({
			user_email: newEmail,
			user_activated: false,
			user_hash: hash([newEmail, googleUserID, Date.now()])
		}).where('user_google_id', googleUserID).returning('*').then(
			(rows) => {
				var updatedUser = rows[0];
				logger.debug(`Email updated for user "${googleUserID}" to: ${newEmail}`);
				user_activator.sendUserActivationEmail(updatedUser);
				callback(updatedUser);
				trx.commit();
			}
		).catch((reason) => {
			logger.warn('Promise Rejected: ' + reason);
			trx.rollback();
			throw (reason, googleUserID);
		});
	});
};