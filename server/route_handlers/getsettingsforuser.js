var datastore_interface = require('../utilities/datastore_interface');
var logger = require('../utilities/logger.js');


module.exports = function (googleUserID, callback) {
	datastore_interface('settings').select('*').where('user_id', googleUserID)
		.then(
			(rows) => {
				const settings = rows[0];
				if (!settings) {
					logger.warning('No settings could be fetched for the given user_id: ', googleUserID);
					callback();
				} else {
					logger.silly('Settings user object: ' + JSON.stringify(settings));
					callback(null, settings);
				}
			}
		).catch(
			(error) => {
				logger.error('Unknown Error In Fetch User Settings', error);
				callback(error, null);
			}
		);
};