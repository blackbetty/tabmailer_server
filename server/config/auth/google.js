const _ = require('lodash');
const passport = require('passport');
const authenticate = (req, res, next) => {
	const { redir } = req.query;
	const state = redir ? new Buffer(JSON.stringify({ redir })).toString('base64') : undefined;
	const authenticator = passport.authenticate('google', { scope: ['profile'], state , failureRedirect: '/-/fail'});
	authenticator(req, res, next);
};
	
//Google will call this URL

const OAUTH_PROVIDER = 'GOOGLE';
const callback = [
	passport.authenticate('google', { failureRedirect: '/-/failure' }),
	(req, res) => {
		if (req.isAuthenticated()) {
			req.user.oauth_provider = OAUTH_PROVIDER;
			const { state } = req.query;
			const { redir } = JSON.parse(new Buffer(state, 'base64').toString());
			res.redirect(`/#/${redir}`);
		}
	}
];

module.exports = {
	authenticate,
	callback
};