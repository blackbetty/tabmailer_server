// Express and Passport Session
const logout = require('./logout');
// const passport

const github = (passportInstance) => passportInstance.authenticate('github');

// // GitHub will call this URL
const githubCallback = (passportInstance) => [
	passportInstance.authenticate('github', {
		failureRedirect: '/',
		failureFlash: true,
		display: 'popup'
	}),
	function (req, res) {
		// res.redirect('/');
		// dump the user for debugging
		if (req.isAuthenticated()) {
			// let html = '<p>authenticated as user:</p>';
			// html += '<pre>' + JSON.stringify(req.user, null, 4) + '</pre>';
			res.redirect('/#/2');
			console.log(JSON.stringify(req.user, null, 4));
		}
	}
];


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
	logout: logout,
	auth: {
		github: github,
		githubCallback: githubCallback
	}
};