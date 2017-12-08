const datastore_interface = require('../utilities/datastore_interface.js');
var logger = require('../utilities/logger.js');
var cryptFunctions = require('../utilities/data_utilities/crypt_functions.js');
const util = require('util');
const uuidv4 = require('uuid/v4');

module.exports = function (googleUserID, tab_url, tab_title, callback) {
	datastore_interface.transaction(function (trx) {
		trx.insert({
			user_id: googleUserID,
			link_url: cryptFunctions.encrypt(tab_url),
			link_title: cryptFunctions.encrypt(tab_title)
		}).into('links').returning('*').then(
			(rows) => {
				var link = rows[0];
				logger.debug(`Link: "${link.link_title}"\nsaved for user: "${link.user_id}"`);
				logger.silly(link);
				trx.commit();
				callback(null, link);
				return trx.commit;
			}
		).catch((reason) => {
			logger.warn(`Error, saving link object failed: ${reason}`);
			trx.rollback();
			callback(reason, googleUserID);
		});
	});
};