const authenticate = (passportInstance) => passportInstance.authenticate('github');


// GitHub will call this URL
const OAUTH_PROVIDER = 'GITHUB';
const callback = (passportInstance) => [
	passportInstance.authenticate('github', {
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

module.exports = {
	authenticate,
	callback
};