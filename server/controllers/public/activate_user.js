const logger = require('../../utilities/logger');
const user_activator = require('../../background_processors/user_activator');
const path = require('path');
module.exports = (req, res) => {

	logger.info('GET received... \tActivateUser');

	var userHash = req.params.userHash; // not a user object, just the userHash to be activated
	user_activator.activateUser(userHash, function (err, userObject) {
		if (!err) {
			logger.info('USER ACTIVATED SUCCESSFULLY', {
				user: userObject
			});
			res.cookie('tabmailer_data', JSON.stringify(userObject.user_hash));
			res.sendFile(path.join(__dirname + '../../../pages/views/activation/activation.html'));
		} else {
			// if the user activation failed,
			// for example if the hash provided was invalid,
			// we just don't return a cookie, which the UI takes as meaning the activation failed.
			logger.info('USER ACTIVATION FAILED FOR USERHASH ' + userHash, {
				error: err
			});
			res.sendFile(path.join(__dirname + '../../../pages/views/activation/activation.html'));
		}
	});
};