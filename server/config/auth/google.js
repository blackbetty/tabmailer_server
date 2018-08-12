const baseFunctions = require('./base_functions');

const PROVIDER = 'google';

const googleAuthCustomOptions = {
	scope: ['profile'],
};

const google = {
	authenticate: baseFunctions.authenticate({
		provider: PROVIDER,
		authCustomOptions: googleAuthCustomOptions,
	}),
	callback: baseFunctions.callback(PROVIDER)
};

module.exports = google;