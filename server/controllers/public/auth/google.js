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
			res.redirect('/#/2');
			// console.log(JSON.stringify(req.user, null, 4));
		}
	}
];

module.exports ={
	authenticate,
	callback
};