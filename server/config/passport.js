var passport = require('passport');

var GithubStrategy = require('passport-github').Strategy;

passport.use(new GithubStrategy({
	clientID: '739ab279e272b81baa0b',
	clientSecret: '1f127e83b84ca87ee5a83445141e1d58cce30979',
	callbackURL: 'https://localhost:5000/auth/github/callback'
},
function (accessToken, refreshToken, profile, done) {
	return done(null, profile);
}
));

module.exports = passport;