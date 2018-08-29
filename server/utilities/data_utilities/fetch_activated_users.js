const logger = require('../logger.js');
const datastore_interface = require('../datastore_interface.js');



function mapLinksToUserObjects(arr) {
	var result = {};
	for (let val of arr) {
		if (!result[val.user_oauth_id]) {
			result[val.user_oauth_id] = {};
		}
		result[val.user_oauth_id].user_email = val.user_email;
		result[val.user_oauth_id].settings = {
			email_format: val.email_format,
			run_frequency: val.run_frequency
		};
		if (result[val.user_oauth_id].link_array) {
			result[val.user_oauth_id].link_array.push({
				link_id: val.link_id,
				link_date_created: val.link_date_created,
				link_url: val.link_url,
				link_title: val.link_title
			});
		} else {
			result[val.user_oauth_id].link_array = [{
				link_id: val.link_id,
				link_date_created: val.link_date_created,
				link_url: val.link_url,
				link_title: val.link_title
			}];
		}
	}
	return result;
}

module.exports = async function fetchAllActivatedUserObjects() {
	return new Promise((resolve, reject) => {
		datastore_interface('users').select('*').innerJoin('links', 'users.user_oauth_id', 'links.user_id').innerJoin('settings', 'settings.user_id', 'users.user_oauth_id').where('user_activated', true)
			.then(
				(rows) => {
					const usersWithLinks = mapLinksToUserObjects(rows);

					if (!usersWithLinks) {
						reject();
					} else {
						resolve(usersWithLinks);
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