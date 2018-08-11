const passport = require('passport');
const User = require('../../../models/user');
const _ = require('lodash');
const authenticate = (req, res, next) => { 
	const { redir } = req.query;
	const state = redir ? new Buffer(JSON.stringify({ redir })).toString('base64') : undefined;
	const authenticator = passport.authenticate('github', { failureRedirect: '/-/fail' });
	return authenticator(req, res, next);
};

// GitHub will call this URL
const OAUTH_PROVIDER = 'GITHUB';
const callback = [
	passport.authenticate('github', { failureRedirect: '/login' }),
	(req, res) => {
		if (req.isAuthenticated()) {
			if (User.findByID(req.user.id)){
				req.user.oauth_provider = OAUTH_PROVIDER;
				res.redirect(_.get(req, 'headers.referer') || '/#/2');
			} else {
				req.logout();
				res.sendState('404');
			}
		}
	}
];

module.exports = {
	authenticate,
	callback
};