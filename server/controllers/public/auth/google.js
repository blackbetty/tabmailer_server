const _ = require('lodash');
const authenticate = (passportInstance) => passportInstance.authenticate('google');
//Google will call this URL

const OAUTH_PROVIDER = 'GOOGLE';
const callback = (passportInstance) => [
	passportInstance.authenticate('google', {
		failureRedirect: '/',
		failureFlash: true,
		display: 'popup'
	}),
	function (req, res) {
		if (req.isAuthenticated()) {
			req.user.oauth_provider = OAUTH_PROVIDER;
			res.redirect(_.get(req, 'headers.referer') || '/#/2');
		}
	}
];

module.exports ={
	authenticate,
	callback
};