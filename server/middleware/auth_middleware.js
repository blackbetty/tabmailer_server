const logger = require('../utilities/logger.js');
const getGoogleIDForAccessToken = require('../utilities/router_utilities/get_google_id_for_access_token.js');
const getGoogleIDForIDToken = require('../utilities/router_utilities/get_google_uID_for_id_token.js');

const auth = function (req, res, next) {

	function internalErrorResponse(error, message) {
		logger.warn(message, {
			error_body: error
		});
		res.status(500).send(`Internal Error:\n\t${message} ${error}`);
	}

	if (req.method === 'GET') {
		if (req.query.google_access_token) req.body.google_access_token = req.query.google_access_token;
		if (req.query.google_id_token) req.body.google_id_token = req.query.google_id_token;
	}

	if (req.body.google_access_token) {
		logger.silly('Any errors here are Google and their stupid god damn OAuth implentation for CRX\'s fault. AccessToken.');
		getGoogleIDForAccessToken(req.body.google_access_token)
			.then((uID) => {
				req.user_id = uID;
				next();
			})
			.catch((e) => {
				internalErrorResponse(e, 'Failed to fetch googleUserID for the given access_token: ');
			});
	} else {
		logger.silly('Any errors here are Google and their stupid god damn OAuth implentation for CRX\'s fault. IDToken.');
		getGoogleIDForIDToken(req.body.google_id_token)
			.then((uID) => {
				req.user_id = uID;
				next();
			})
			.catch((e) => {
				internalErrorResponse(e, 'Failed to fetch googleUserID for the given id_token: ');
			});
	}
};

const testEnvAuth = (req, res, next) => { 
	req.user_id = Math.random() * 1000000000000000000000;
	next();
};

module.exports = process.env.RANDOMIZE_UID === 'on' ? testEnvAuth : auth;