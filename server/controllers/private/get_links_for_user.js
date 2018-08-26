const datastore_interface = require('../../utilities/datastore_interface.js');
const logger = require('../../utilities/logger.js');
var cryptFunctions = require('../../utilities/data_utilities/crypt_functions.js');
const _ = require('lodash');

module.exports = async function (user_id) {

	const rows = await datastore_interface('links').select('*').where({
		user_id
	});
	try {

		const links = rows;
		if (!links) {
			logger.warning('No Links could be fetched for the given user_id: ', user_id);

		} else {
			logger.silly('Links user object: ' + JSON.stringify(links));
			_.each(links, (link_object) => {
				try {
					link_object.link_title = cryptFunctions.decrypt(link_object.link_title);
					link_object.link_url = cryptFunctions.decrypt(link_object.link_url);
				} catch (error) {
					logger.error('Decyphering article title failed for article: ' + link_object.link_title);
				}
			});
		}
		return links;

	} catch (error) {

		logger.error('Unknown Error In Fetch User Links', error);
		throw (error, null);

	}
};