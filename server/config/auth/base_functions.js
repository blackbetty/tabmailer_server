const passport = require('passport');
const defaultFailureRedirect = '/-/fail'
const User = require('../../models/user');
const _ = require('lodash');

const authenticate = (options) => {
    return (req, res, next) => {
        const { redir, hash } = req.query;
        const state = redir || hash ? new Buffer(JSON.stringify({ redir, hash })).toString('base64') : undefined;
        const authenticator = passport.authenticate(options.provider, {
            state,
            failureRedirect: options.failureRedirect || defaultFailureRedirect,
            ...options.authCustomOptions
        });
        authenticator(req, res, next);
    };
};

//Google will call this URL
const callback = (provider, failureRedirect) => [
        passport.authenticate(provider, { failureRedirect: failureRedirect || defaultFailureRedirect }),
        async (req, res) => {
			if (req.isAuthenticated()) {
				req.user.oauth_provider = provider;
                const user = (await User.findByID(req.user.id))[0];
                if (user) {
					req.user.exists = true; // Hack to allow us to redirect users who already exist straight to the dashboard
					const { state } = req.query;
					const { redir, hash } = JSON.parse(new Buffer(state, 'base64').toString());
					const endpoint = hash ? `/#/${redir}` : `/${redir}`;
                    res.redirect(endpoint);
                } else {
					if (_.get(req, 'headers.referer') == process.env.HOST) { // If the referer is the base url, that means we're attempting a signup
						res.redirect('/#/2');
					} else {
                    	req.logout();
                        res.redirect('/login');
                    }
                }
            }
        }
    ];

module.exports = {
    authenticate: authenticate,
    callback: callback
}