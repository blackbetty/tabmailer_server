var datastore_interface = require('../utilities/datastore_interface');
var logger = require('../utilities/logger.js');



module.exports = function (googleUserID, callback) {

	datastore_interface.transaction(function (trx) {
		datastore_interface('users').update({
			settings_changed: false
		}).where('user_google_id', googleUserID).returning('*').then(
			(user) => {
				logger.debug(`settingsChanged Reset For:\t${user.user_id}`);

				if (callback) {
					callback(user);
				}
				trx.commit;
			}
		).catch((reason) => {
			logger.warn('Settings Changed Set False Promise Rejected: ' + reason);
			trx.rollback;
			throw (reason, googleUserID);
		});
	});
	// var query = datastoreClient.createQuery('tabmailer_user').limit(1);


	// query.filter('google_user_id', googleUserID);


	// datastoreClient.runQuery(query, function(err, entities) {
	//     var userEntity = entities[0];


	//     userEntity['settingsChanged'] = false;



	//     datastoreClient.update(userEntity)
	//         .then(() => {
	//             // Task updated successfully.

	//             logger.debug(`settingsChanged Reset For:\t${userEntity.username}`);

	//             if (callback) {
	//                 callback(userEntity);
	//             }

	//         });
	// });
}