const datastore_interface = require('../utilities/datastore_interface.js');
var hash = require('object-hash');
var user_activator = require('../background_processors/user_activator.js');
require('dotenv').config();
const logger = require('../utilities/logger.js');
const util = require('util');



module.exports = function (emailaddress, username, google_user_id, callback) {
	// var query = datastoreClient.createQuery('tabmailer_user').limit(1);

	//fix this later to use authkey
	// query.filter('google_user_id', google_user_id);


	// Using trx as a transaction object:
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
				var entity = rows[0];
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
	// .then(function (rowArray) {
	// 	console.log('rowArray');
	// 	callback(rowArray[0]);
	// }).catch(function (error) {
	// 	logger.error(`User creation error - ${error}`);
	// 	if (error.code == 23505) {
	// 		callback({
	// 			error: 'A user for this ID already exists'
	// 		});
	// 	}
	// });

	// datastoreClient.runQuery(query, function (err, entities) {
	// 	if (entities && entities[0]) {
	// 		logger.error(`A user for the username ${google_user_id} already exists`);
	// 		callback({
	// 			error: 'A user for this ID already exists'
	// 		}); // a user for this user_id already exists
	// 	} else {
	// 		var userKey = {
	// 			kind: 'tabmailer_user'
	// 		};
	// 		logger.silly(google_user_id);
	// 		var user = {
	// 			emailaddress: emailaddress,
	// 			google_user_id: google_user_id,
	// 			username: username,
	// 			article_list: [],
	// 			settings: {
	// 				frequency: 'DAILY',
	// 				close_tab: true,
	// 				email_format: 'individual'
	// 			},
	// 			settingsChanged: true,
	// 			date_user_created: Date.now(),
	// 			activated: false
	// 		};
	// 		user.user_hash = hash(user);

	// 		const entity = {
	// 			key: userKey,
	// 			data: user
	// 		};

	// 		datastoreClient.insert(entity)
	// 			.then(() => {
	// 				// Task inserted successfully

	// 				user_activator.sendUserActivationEmail(entity);
	// 				logger.silly(entity);
	// 				callback(entity);
	// 			});
	// 	}
	// });

};