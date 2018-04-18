// Express and Passport Session
const logout = require('./logout');
const google = require('./google');
const github = require('./github');




// function ensureAuthenticated(req, res, next) {
// 	if (req.isAuthenticated()) {
// 		// req.user is available for use here
// 		return next();
// 	}

// 	// denied. redirect to login
// 	res.redirect('/');
// }

// app.get('/logout', function (req, res) {
// 	logger.info('logging out');
// 	req.logout();
// 	res.redirect('/');
// });

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