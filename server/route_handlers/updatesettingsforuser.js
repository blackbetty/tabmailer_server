const datastore_interface = require('../utilities/datastore_interface.js');
var logger = require('../utilities/logger.js');

module.exports = function (googleUserID, newSettings, newSettingKey, callback) {

	datastore_interface.transaction(function (trx) {
		trx('settings').update({
			[newSettingKey]: newSettings
		}).where('user_id', googleUserID).returning('*').then(
			(rows) => {
				var settings = rows[0];
				trx.commit();
				logger.debug(`Settings updated for:\t${settings.user_id}`);
				callback(settings);
			}

		).catch((reason) => {
			logger.warn(`Error, saving settings object failed: ${reason}`);
			trx.rollback();
			throw(reason, googleUserID);
		});
	});
};