// Express and Passport Session
const logout = require('./logout');
const google = require('./google');
const github = require('./github');

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