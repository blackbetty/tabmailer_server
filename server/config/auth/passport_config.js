const passport = require('passport');


passport.serializeUser(function (user, done) {
	// placeholder for custom user serialization
	// null is for errors
	done(null, user);
});

passport.deserializeUser(function (user, done) {
	// placeholder for custom user deserialization.
	// maybe get the user from mongo by id?
	// null is for errors
	done(null, user);
});


function responseHandler(req, accessToken, refreshToken, params, profile, done) {
	return done(null, profile);
}

const GithubStrategy = require('passport-github').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitlabStrategy = require('passport-gitlab2').Strategy;

const githubConfig = {
	clientID: process.env.GITHUB_CLIENTID,
	clientSecret: process.env.GITHUB_CLIENT_SECRET,
	callbackURL: `${process.env.HOST}auth/github/callback`,
	passReqToCallback: true
};

const googleConfig = {
	clientID: process.env.GAPI_CLIENTID,
	clientSecret: process.env.GAPI_CLIENT_SECRET,
	userProfileURL: 'https://www.googleapis.com/oauth2/v3/userinfo',
	scope: ['profile'],
	callbackURL: `${process.env.HOST}auth/google/callback`,
	passReqToCallback: true
};

const gitlabConfig = {
	clientID: process.env.GITLAB_CLIENTID,
	clientSecret: process.env.GITLAB_CLIENT_SECRET,
	callbackURL: `${process.env.HOST}auth/gitlab/callback`,
	passReqToCallback: true
};

passport.use(new GithubStrategy(githubConfig,responseHandler));
passport.use(new GoogleStrategy(googleConfig,responseHandler));
passport.use(new GitlabStrategy(gitlabConfig, responseHandler));

module.exports = passport;