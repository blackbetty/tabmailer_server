const Datastore = require('@google-cloud/datastore');
const logger = require('../utilities/logger.js');
var cryptFunctions = require('../utilities/data_utilities/crypt_functions.js');
const _ = require('lodash');

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

function hasWhiteSpace(s) {
	return /\s/g.test(s);
}

module.exports = function (googleUserID, callback) {
	var query = datastoreClient.createQuery('tabmailer_user').limit(1);

	// switch this for authKey later
	query.filter('google_user_id', googleUserID);


	datastoreClient.runQuery(query, function (err, entities) {
		var userEntity = entities[0];
		logger.silly(userEntity);
		_.each(userEntity.article_list, (articleObject) => {
			if (!hasWhiteSpace(articleObject.article_title) && !hasWhiteSpace(articleObject.article_url)){
				articleObject.article_title = cryptFunctions.decrypt(articleObject.article_title);
				articleObject.article_url = cryptFunctions.decrypt(articleObject.article_url);
			}
		});
		callback(userEntity);
	});
};