const logout = require('./logout');
const github = require('./github');
const google = require('./google');
const gitlab = require('./gitlab');

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
		},
		gitlab: {
			authenticate: gitlab.authenticate,
			callback: gitlab.callback
		}
	}
};