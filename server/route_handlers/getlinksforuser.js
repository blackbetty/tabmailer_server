const datastore_interface = require('../utilities/datastore_interface.js');
const logger = require('../utilities/logger.js');
var cryptFunctions = require('../utilities/data_utilities/crypt_functions.js');
const _ = require('lodash');

module.exports = function (googleUserID, callback) {

	datastore_interface('links').select('*').where('user_id', googleUserID)
		.then(
			(rows) => {
				const links = rows;
				if (!links) {
					logger.warning('No settings could be fetched for the given user_id: ', googleUserID);
					callback();
				} else {
					logger.silly('Settings user object: ' + JSON.stringify(links));
					_.each(links, (link_object) => {
						try {
							link_object.link_title = cryptFunctions.decrypt(link_object.link_title);
							link_object.link_url = cryptFunctions.decrypt(link_object.link_url);
						} catch (error) {
							logger.error('Decyphering article title failed for article: ' + link_object.link_title);
						}
					});
					callback(links);
				}
			}
		).catch(
			(error) => {
				logger.error('Unknown Error In Fetch User Settings', error);
				throw (error, null);
			}
		);
	// var query = datastoreClient.createQuery('tabmailer_user').limit(1);

	// // switch this for authKey later
	// query.filter('google_user_id', googleUserID);


	// datastoreClient.runQuery(query, function (err, entities) {
	// 	var userEntity = entities[0];
	// 	logger.silly(userEntity);
	// 	_.each(userEntity.article_list, (articleObject) => {
	// 		if (!hasWhiteSpace(articleObject.article_title) && !hasWhiteSpace(articleObject.article_url)){
	// 			try{
	// 				articleObject.article_title = cryptFunctions.decrypt(articleObject.article_title);
	// 				articleObject.article_url = cryptFunctions.decrypt(articleObject.article_url);
	// 			} catch(error) {
	// 				logger.error('Decyphering article title failed for article: '+articleObject.article_title);
	// 			}
	// 		}
	// 	});
	// 	callback(userEntity);
	// });
};