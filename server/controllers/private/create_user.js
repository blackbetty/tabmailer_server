const datastore_interface = require('../../utilities/datastore_interface.js');
var hash = require('object-hash');
var user_activator = require('../../background_processors/user_activator.js');
require('dotenv').config();
const logger = require('../../utilities/logger.js');
const util = require('util');



module.exports = async (emailaddress, username, oauth_user_id, oauth_provider) => {
	// TODO: Refactor to be more async/await-ish
	return await datastore_interface.transaction(async (trx) => {
		
		var user = {
			user_oauth_id: oauth_user_id,
			user_email: emailaddress,
			user_name: username,
			oauth_provider: oauth_provider
		};

		user.user_hash = hash(user);

		var settings = {
			user_id: oauth_user_id,
			run_frequency: 'DAILY',
			close_tab: true,
			email_format: 'INDIVIDUAL'
		};

		
		try {
			// need to resolve pUser here, but don't necessarily need settings just yet
			var pUser = await trx('users').returning('*').insert(user);
			await trx('settings').returning('*').insert(settings);

			
			const entity = pUser[0];
			user_activator.sendUserActivationEmail(entity);
			return pUser;
		} catch(error){
			
			logger.error(`User creation error - ${error}`);
			if (error.code == 23505) {
				return {
					error: 'A user for this ID already exists'
				};
			} else {
				throw error;
			}
		}
	});
	
};