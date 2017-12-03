const datastore_interface = require('../utilities/datastore_interface.js');
var hash = require('object-hash');
var user_activator = require('../background_processors/user_activator.js');
require('dotenv').config();
const logger = require('../utilities/logger.js');
const util = require('util');



module.exports = function (emailaddress, username, google_user_id, callback) {
	
	datastore_interface.transaction(function (trx) {
		var user = {
			user_google_id: google_user_id,
			user_email: emailaddress,
			user_name: username,
		};
		user.user_hash = hash(user);

		var settings = {
			user_id: google_user_id,
			run_frequency: 'DAILY',
			close_tab: true,
			email_format: 'INDIVIDUAL'
		};

		var pUser = new Promise((resolve, reject) => {
			datastore_interface('users').returning('*').insert(user).then((rows) => resolve(rows)).catch((error) => reject(error));
		});
		var pSettings = new Promise((resolve, reject) => {
			datastore_interface.table('settings').insert(settings).then(resolve).catch((error) => reject(error));
		});

		Promise.all([pUser, pSettings])
			.then((rows) => {
				trx.commit;
				var entity = rows[0][0];
				user_activator.sendUserActivationEmail(entity);
				callback(rows);
			})
			.catch((error) => {
				trx.rollback;
				logger.error(`User creation error - ${error}`);
				if (error.code == 23505) {
					callback({
						error: 'A user for this ID already exists'
					});
				}
			});
	});
};