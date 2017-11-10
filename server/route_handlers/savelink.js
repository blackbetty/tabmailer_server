const Datastore = require('@google-cloud/datastore');
var logger = require('../utilities/logger.js');
var cryptFunctions = require('../utilities/data_utilities/crypt_functions.js');
const util = require('util');
const uuidv4 = require('uuid/v4');


// Refactor this into its own file later
// *****************************************************************

const projectId = 'tabmailer-174400';

// Instantiates a client
const datastoreClient = Datastore({
	projectId: projectId
});

if (process.env.NODE_ENV === 'development') {
	var config = {
		projectId: projectId,
		keyFilename: '../keys/tabmailer-946de2b4591a.json'
	};
}

// *****************************************************************


module.exports = function (googleUserID, tab_url, tab_title, callback) {
	var query = datastoreClient.createQuery('tabmailer_user').limit(1);


	query.filter('google_user_id', googleUserID);


	datastoreClient.runQuery(query, (err, entities) => {
		try {
			if (entities[0] == undefined) {
				logger.verbose(`Attempt to fetch user for ID ${googleUserID} return no Entity`);
				var error = new Error();
				error.message = 'It looks like a user for GoogleID that ID doesn\'t exist, did you complete signup?';
				error.name = 'UserDoesNotExistError';
				callback(error, null);
				return;
			}
			var userEntity = entities[0];
			var article_entity = {
				article_url: cryptFunctions.encrypt(tab_url),
				article_title: cryptFunctions.encrypt(tab_title),
				article_id: uuidv4(),
				datetime_added: Date.now()
			};

			userEntity['article_list'].push(article_entity);
			datastoreClient.update(userEntity)
				.then(() => {

					logger.debug(`Link: "${tab_title}"\nsaved for user: "${userEntity.username}"`);
					logger.silly(userEntity);

					callback(null, userEntity);
				}).catch((reason) => {
					logger.warn(`Error, updating link object failed: ${reason}`);
					callback(reason, userEntity);
				});

		} catch (error) {
			logger.error(`An error occurred saving link data for the user with googleUserID [${googleUserID}], reason:\n\n${error}`);
		}
	});
};