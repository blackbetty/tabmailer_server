var datastore_interface = require('../utilities/datastore_interface.js');


const findByID = async (id) => await datastore_interface('users').returning('*').where('user_oauth_id', id).limit(1);

const user = {
	findByID
};
module.exports = user;