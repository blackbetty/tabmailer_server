const passport = require('passport');
const User = require('../../models/user');
const _ = require('lodash');
const authenticate = (req, res, next) => { 
	const { redir } = req.query;
	const state = redir ? new Buffer(JSON.stringify({ redir })).toString('base64') : undefined;
	const authenticator = passport.authenticate('github', { state: state, failureRedirect: '/-/fail' });
	return authenticator(req, res, next);
};

// GitHub will call this URL
const OAUTH_PROVIDER = 'GITHUB';
const callback = [
	passport.authenticate('github', { failureRedirect: '/login' }),
	async (req, res) => {
		if (req.isAuthenticated()) {
			const user = await User.findByID(req.user.id);
			if (user){
				req.user.oauth_provider = OAUTH_PROVIDER;
				const { state } = req.query;
				const { redir } = JSON.parse(new Buffer(state, 'base64').toString());
				res.redirect(`/#/${redir}`);
			} else {
				req.logout();
				if(_.get(req, 'headers.referer') == process.env.HOST){ // If the referer is the base url, that means we're attempting a signup
					res.redirect('/#/2');
				} else {
					res.redirect('/login');
				}
			}
		}
	}
];

module.exports = {
	authenticate,
	callback
};