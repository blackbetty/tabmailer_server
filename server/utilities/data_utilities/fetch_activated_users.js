const logger = require('../logger.js');
const datastore_interface = require('../datastore_interface.js');
module.exports = async function fetchAllActivatedUsers() {
	return new Promise((resolve, reject) => {
		datastore_interface('users').select('*').where('user_activated', true)
			.then(
				(rows) => {
					const users = rows;
					if (!users) {
						reject();
					} else {
						resolve(users);
					}
				}
			).catch(
				(error) => {
					logger.error('Unknown Error In Fetch User Settings', error);
					reject(error); // no user found

				}
			);
	});
};