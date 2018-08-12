const baseFunctions = require('./base_functions');

const PROVIDER = 'github';
const overrideFailureRedirect = 'login';

const github = {
	authenticate: baseFunctions.authenticate({
		provider: PROVIDER
	}),
	callback: baseFunctions.callback(PROVIDER, overrideFailureRedirect)
};

module.exports = github;