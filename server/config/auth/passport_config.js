const passport = require('passport');


// WIP
passport.serializeUser(function (user, done) {
	// placeholder for custom user serialization
	// null is for errors
	done(null, user);
});

passport.deserializeUser(function (user, done) {
	// placeholder for custom user deserialization.
	// maybe you are going to get the user from mongo by id?
	// null is for errors
	done(null, user);
});


function responseHandler(req, accessToken, refreshToken, params, profile, done) {
	return done(null, profile);
}

const GithubStrategy = require('passport-github').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const githubConfig = {
	clientID: '739ab279e272b81baa0b',
	clientSecret: '1f127e83b84ca87ee5a83445141e1d58cce30979',
	callbackURL: 'https://localhost:5000/auth/github/callback',
	passReqToCallback: true
};

const googleConfig = {
	clientID: process.env.GAPI_CLIENTID,
	clientSecret: process.env.GAPI_CLIENT_SECRET,
	userProfileURL: 'https://www.googleapis.com/oauth2/v3/userinfo',
	scope: ['profile'],
	callbackURL: 'https://localhost:5000/auth/google/callback',
	passReqToCallback: true
};

passport.use(new GithubStrategy(githubConfig,responseHandler));
passport.use(new GoogleStrategy(googleConfig,responseHandler));

module.exports = passport;