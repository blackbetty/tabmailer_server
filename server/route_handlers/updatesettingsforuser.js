const datastore_interface = require('../utilities/datastore_interface.js');
var logger = require('../utilities/logger.js');

module.exports = async function (googleUserID, newSettings, newSettingKey) {

	try {
		const rows = await datastore_interface.transaction((trx) =>
			trx('settings').update({
				[newSettingKey]: newSettings
			}).where('user_id', googleUserID).returning('*')
		);
		const settings = rows[0];

		logger.debug(`Settings updated for:\t${settings.user_id}`);
		return settings;
	} catch (error) {
		logger.warn(`Error, saving settings object failed: ${error}`);
		throw (error, googleUserID);
	}
};