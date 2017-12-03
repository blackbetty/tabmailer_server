const datastore_interface = require('../utilities/datastore_interface.js');
var logger = require('../utilities/logger.js');

module.exports = function (googleUserID, newSettings, newSettingKey, callback) {


	console.log(`––––––––––––––––––––––––––––––––––––${newSettingKey}`);
	console.log(`––––––––––––––––––––––––––––––––––––${newSettings}`);
	datastore_interface.transaction(function (trx) {
		datastore_interface('settings').update({
			[newSettingKey]: newSettings
		}).where('user_id', googleUserID).returning('*').then(
			(rows) => {
				var settings = rows[0];
				trx.commit;
				logger.debug(`Settings updated for:\t${settings.user_id}`);
				callback(settings);
			}

		).catch((reason) => {
			logger.warn(`Error, saving settings object failed: ${reason}`);
			trx.rollback;
			throw(reason, googleUserID);
		});
	});
	// var query = datastoreClient.createQuery('tabmailer_user').limit(1);


	// query.filter('google_user_id', googleUserID);


	// datastoreClient.runQuery(query, function (err, entities) {
	// 	var userEntity = entities[0];


	// 	// Some user objects don't have settings because I didn't account for them at first
	// 	if (!userEntity['settings']) {
	// 		userEntity['settings'] = {};
	// 	}

	// 	userEntity['settings'][newSettingKey] = newSettings;
	// 	userEntity['settingsChanged'] = true;



	// 	datastoreClient.update(userEntity)
	// 		.then(() => {
	// 			// Task updated successfully.
	// 			logger.debug(`Settings updated for:\t${userEntity.username}`);
	// 			callback(userEntity);
	// 		});
	// });
}