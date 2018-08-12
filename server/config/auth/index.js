const logout = require('./logout');
const github = require('./github');
const google = require('./google');

module.exports = {
	// logout: logout,
	providers: {
		github: {
			authenticate: github.authenticate,
			callback: github.callback
		},
		google: {
			authenticate: google.authenticate,
			callback: google.callback
		}
	}
};
