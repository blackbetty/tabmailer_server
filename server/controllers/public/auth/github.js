const authenticate = (passportInstance) => passportInstance.authenticate('github');


// GitHub will call this URL
const callback = (passportInstance) => [
	passportInstance.authenticate('github', {
		failureRedirect: '/',
		failureFlash: true,
		display: 'popup'
	}),
	async function (req, res) {
		if (req.isAuthenticated()) {
			console.log(JSON.stringify(req.user, null, 4));
			req.session.save();
			return  res.redirect('/#/2');
		}
	}
];

module.exports = {
	authenticate,
	callback
};