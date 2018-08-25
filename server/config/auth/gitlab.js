const baseFunctions = require('./base_functions');

const PROVIDER = 'gitlab';


const gitlab = {
	authenticate: baseFunctions.authenticate({
		provider: PROVIDER
	}),
	callback: baseFunctions.callback(PROVIDER)
};

module.exports = gitlab;