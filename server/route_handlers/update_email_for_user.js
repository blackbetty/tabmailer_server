const datastore_interface = require('../utilities/datastore_interface.js');
const user_activator = require('../background_processors/user_activator.js');
var hash = require('object-hash');
var logger = require('../utilities/logger.js');


module.exports = function (googleUserID, newEmail, callback) {
	var query = datastoreClient.createQuery('tabmailer_user').limit(1);


	query.filter('google_user_id', googleUserID);


	datastoreClient.runQuery(query, function (err, entities) {
		var userEntity = entities[0];

		userEntity['emailaddress'] = newEmail;
		userEntity['activated'] = false;
		userEntity.user_hash = hash(userEntity);
		datastoreClient.update(userEntity)
			.then(() => {
				logger.debug(`Email updated for user "${userEntity.username}" to: ${userEntity.emailaddress}`);


				// some stupid bullshit for the method signature
				var userKey = {
					kind: 'tabmailer_user'
				}

				const activationEntity = {
					key: userKey,
					data: userEntity
				};




				user_activator.sendUserActivationEmail(activationEntity);
				callback(userEntity);
			}).catch(function (reason) {
				logger.warn("Promise Rejected: " + reason);
			});
	});
}