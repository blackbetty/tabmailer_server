require('dotenv').config();
var express = require('express');
// var sync = require('synchronize');
var app = express();
var bodyParser = require('body-parser');
var path = require('path');
var httpsRedirect = require('express-https-redirect');
const Celebrate = require('celebrate');
const {
	Joi
} = Celebrate;
const session = require('express-session');
const passport = require('./config/passport');
// Route Handlers
var getLinksForUser = require('./route_handlers/getlinksforuser.js');
var getSettingsForUser = require('./route_handlers/getsettingsforuser.js');
var saveLink = require('./route_handlers/savelink.js');
var resetSettingsChangedAttrib = require('./route_handlers/reset_settings_changed_attrib.js');
var updateEmailForUser = require('./route_handlers/update_email_for_user.js');
var updateSettingsForUser = require('./route_handlers/updatesettingsforuser.js');
var createUser = require('./route_handlers/create_user.js');

// Background Processors
var user_activator = require('./background_processors/user_activator.js');
var cron_functions = require('./background_processors/cron_functions.js');

// Utilities
const logger = require('./utilities/logger.js');
// Router Utilities
const getGoogleIDForAccessToken = require('./utilities/router_utilities/get_google_id_for_access_token.js');
const getGoogleIDForIDToken = require('./utilities/router_utilities/get_google_uID_for_id_token.js');

// API Request Schemas
const SCHEMA_POST_LINKS = require('./request_schemas/link_collection_routes/links_POST_schema.js');
const SCHEMA_GET_LINKS = require('./request_schemas/link_collection_routes/links_GET_schema.js');
const SCHEMA_RES_LINKS = require('./request_schemas/link_collection_routes/links_RESPONSE_schema.js');
const SCHEMA_POST_CREATEUSER = require('./request_schemas/user_routes/user_creation_POST_schema.js');
const SCHEMA_GET_ACTIVATEUSER = require('./request_schemas/user_routes/user_activation_GET_schema.js');
const SCHEMA_GET_SETTINGS = require('./request_schemas/settings_routes/settings_GET_schema.js');
const SCHEMA_POST_SETTINGS = require('./request_schemas/settings_routes/settings_POST_schema.js');
const SCHEMA_POST_EMAIL = require('./request_schemas/settings_routes/email_POST_schema.js');



/*
 *
 * Server Config
 *
 */

// app.use(function(req, res, next) {
// 	sync.fiber(next);
// });

app.use('/', httpsRedirect());

cron_functions.scheduleAllJobs();

app.use('/pages', express.static(__dirname + '/pages'));



app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({
	extended: true
}));

app.use(function (req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
	next();
});

/*
 *
 * End server config
 *
 */



/*
 *
 * Page Routes
 *
 */

app.get('/', function (req, res) {
	if (req.headers['user-agent'] != 'GoogleStackdriverMonitoring-UptimeChecks(https://cloud.google.com/monitoring)') logger.info('GET received... \tHomepage ');
	res.sendFile(path.join(__dirname + '/pages/views/home.html'));
});

app.get('/signup', function (req, res) {
	logger.info('GET received... \tSignup ');
	res.sendFile(path.join(__dirname + '/pages/views/home.html'));
});

app.get('/dashboard', ensureAuthenticated, function (req, res) {
	logger.info('GET received... \tDashboard ');
	res.sendFile(path.join(__dirname + '/pages/views/dashboard/dashboard.html'));
});


/*
 *
 * User CRUD Routes
 *
 */

app.post('/createUser', Celebrate({
	body: SCHEMA_POST_CREATEUSER
}), function (req, res) {
	logger.info('POST received... \tCreateUser');

	function errorResponse(error, message, errorCode) {
		logger.error(message, error);
		res.status(errorCode).send({
			error_text: message
		});
	}

	function completePost(google_uID) {
		createUser(req.body.emailaddress, req.body.username, google_uID, function (value) {
			// can be false or The Entity
			logger.debug('Google ID', {
				authID: google_uID
			});


			if (value.error) {
				errorResponse(value.error, 'A user for that Google Account already exists, please go to your existing dashboard', 400);
			} else {
				res.send(value);
			}

		});
	}

	getGoogleIDForIDToken(req.body.google_id_token)
		.then((google_uID) => {
			completePost(google_uID);
		})
		.catch((e) => {
			errorResponse(e, 'Failed to fetch googleUserID for the given ID token', 500);
		});
});

app.get('/activateUser/:userHash', Celebrate({
	params: SCHEMA_GET_ACTIVATEUSER
}), (req, res) => {

	logger.info('GET received... \tActivateUser');

	var userHash = req.params.userHash; // not a user object, just the userHash to be activated
	user_activator.activateUser(userHash, function (err, userObject) {
		if (!err) {
			logger.info('USER ACTIVATED SUCCESSFULLY', {
				user: userObject
			});
			res.cookie('tabmailer_data', JSON.stringify(userObject.user_hash));
			res.sendFile(path.join(__dirname + '/pages/views/activation/activation.html'));
			// res.end();
		} else {
			// if the user activation failed,
			// for example if the hash provided was invalid,
			// we just don't return a cookie, which the UI takes as meaning the activation failed.
			logger.info('USER ACTIVATION FAILED FOR USERHASH ' + userHash, {
				error: err
			});
			res.sendFile(path.join(__dirname + '/pages/views/activation/activation.html'));
		}
	});

});

/*
 *
 * Link CRUD Routes
 *
 */

app.post('/linksforuser', Celebrate({
	body: SCHEMA_POST_LINKS
}), (req, res) => {
	logger.info('POST received... \tLinksForUser');

	function executeLinkCollectionUpdate(googleUserID) {
		saveLink(googleUserID, req.body.tab_url, req.body.tab_title, function (err, userEntity) {
			if (!err) {
				if (userEntity.settingsChanged == true) {
					// if its true send an object that contains a url and the settings object
					resetSettingsChangedAttrib(userEntity.google_user_id);
					res.send({
						saved_url: req.body.tab_url,
						newSettings: userEntity.settings
					});
				} else {
					res.send({
						saved_url: req.body.tab_url
					});
				}

			} else {
				userErrorResponse(err);
			}
			logger.silly('User link post succeeded calling callback', {
				tab_url: req.body.tab_url
			});



		});
	}

	function userErrorResponse(error) {
		logger.error('User Link Post Error: ' + error.name);
		res.status(400).send(error);
	}

	function internalErrorResponse(error, message) {
		logger.warn(message, {
			error_body: error
		});
		res.status(500).send(`Internal Error:\n\t${message} ${error}`);
	}

	if (req.body.google_access_token) {
		// fuck you Google and your stupid auth system in chrome extensions
		logger.silly('Any errors here are Google and their stupid god damn OAuth implentation for CRX\'s fault. AccessToken.');
		getGoogleIDForAccessToken(req.body.google_access_token)
			.then((uID) => {
				executeLinkCollectionUpdate(uID);
			})
			.catch((e) => {
				internalErrorResponse(e, 'Failed to fetch googleUserID for the given access_token: ');
			});
	} else {
		logger.silly('Any errors here are Google and their stupid god damn OAuth implentation for CRX\'s fault. IDToken.');
		getGoogleIDForIDToken(req.body.google_id_token)
			.then((uID) => {
				executeLinkCollectionUpdate(uID);
			})
			.catch((e) => {
				internalErrorResponse(e, 'Failed to fetch googleUserID for the given id_token: ');
			});
	}

});

app.get('/linksforuser', Celebrate({
	query: SCHEMA_GET_LINKS
}), (req, res) => {
	logger.info('GET received... \tLinksForUser');

	function errorResponse(error, message) {
		logger.warn(message, error);
		res.status(500).send(`Internal Error:\n\t${message} ${error}`);
	}

	function completeGet(gID) {
		getLinksForUser(gID, function (link_array) {
			Joi.validate(link_array, SCHEMA_RES_LINKS).then((link_array) => {

				var log_msg = link_array[0] ? 'User fetch completed for user: ' + link_array[0].user_id : 'User link collection empty';

				logger.debug(log_msg);
				logger.silly(link_array);
				res.send(link_array);
			}).catch((reason) => res.status(400).send(`Something appears to be wrong with this account: ${reason}`));
		});
	}

	getGoogleIDForIDToken(req.query.google_id_token)
		.then((google_uID) => {
			completeGet(google_uID);
		})
		.catch((e) => {
			errorResponse(e, 'Failed to fetch googleUserID for the given id_token: ');
		});
});


/*
 *
 * Settings CRUD Routes
 *
 */

app.get('/settings', Celebrate({
	query: SCHEMA_GET_SETTINGS
}), (req, res) => {

	logger.info('GET received... \tSettings ');

	function errorResponse(error, message) {
		logger.warn(message, error);
		res.status(500).send(`Internal Error:\n\t${message} ${error}`);
	}

	function completeGet(gID) {
		getSettingsForUser(gID, function (err, settings) {
			if (!err) {
				logger.debug('User fetched for user settings request');
				logger.silly(settings);
				var status_code = 404;
				var res_val = 'No settings found for given User ID';
				if (settings) {
					status_code = 200;
					res_val = settings;
				}
				res.status(status_code).send(res_val);
			} else {
				res.status(500).send('Internal Server Error while fetching settings');
			}
		});
	}


	if (req.query.google_access_token) {
		// fuck you Google and your stupid auth system in chrome extensions
		logger.silly('Any errors here are Google and their stupid god damn OAuth implentation for CRX\'s fault. Settings AccessToken.');
		getGoogleIDForAccessToken(req.query.google_access_token)
			.then((uID) => {
				completeGet(uID);
			})
			.catch((e) => {
				errorResponse(e, 'Failed to fetch googleUserID for the given access_token: ');
			});
	} else {
		logger.silly('Any errors here are Google and their stupid god damn OAuth implentation for CRX\'s fault. Settings IDToken.');
		getGoogleIDForIDToken(req.query.google_id_token)
			.then((uID) => {
				completeGet(uID);
			})
			.catch((e) => {
				errorResponse(e, 'Failed to fetch googleUserID for the given id_token: ');
			});
	}

	// getGoogleIDForIDToken(req.query.google_id_token)
	// 	.then((google_uID) => { completeGet(google_uID) })
	// 	.catch((e) => { errorResponse(e, 'Failed to fetch googleUserID for the given id_token: ') });
});

app.post('/settings', Celebrate({
	body: SCHEMA_POST_SETTINGS
}), (req, res) => {

	logger.debug('POST received... \tSettings');

	function errorResponse(error, message) {
		logger.warn(message, error);
		res.status(500).send(`Internal Error:\n\t${message} ${error}`);
	}

	function completeSet(googleUserID) {
		updateSettingsForUser(googleUserID, req.body[req.body.newKey], req.body.newKey, function (settings) {
			logger.debug('User fetched for user settings POST request');
			logger.silly(settings);
			var status_code = 404;
			var res_val = 'No user exists for that ID';
			if (settings) {
				status_code = 200;
				res_val = settings;
			}
			res.status(status_code).send(res_val);
		});
	}


	getGoogleIDForIDToken(req.body.google_id_token)
		.then((google_uID) => {
			completeSet(google_uID);
		})
		.catch((e) => {
			errorResponse(e, 'Failed to fetch googleUserID for the given id_token: ');
		});
});



app.post('/email', Celebrate({
	body: SCHEMA_POST_EMAIL
}), (req, res) => {

	logger.info('POST received... \tEmail');

	function errorResponse(error, message) {
		logger.warn(message, error);
		res.status(500).send(`Internal Error:\n\t${message} ${error}`);
	}


	function completeSet(googleUserID) {
		updateEmailForUser(googleUserID, req.body.emailaddress, function (userEntity) {
			if (!userEntity) {
				res.status(404).send('No user exists for that ID or an unknown error occurred');
			} else {
				res.status(200).send(userEntity);
			}
		});
	}

	getGoogleIDForIDToken(req.body.google_id_token)
		.then((google_uID) => {
			completeSet(google_uID);
		})
		.catch((e) => {
			errorResponse(e, 'Failed to fetch googleUserID for the given id_token: ');
		});
});

app.get('/logout', function (req, res) {
	req.logout();
	res.redirect('/');
});

// Express and Passport Session

app.use(session({
	secret: 'abstractsecret'
}));
app.use(passport.initialize());
app.use(passport.session());

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


// we will call this to start the GitHub Login process
app.get('/auth/github', passport.authenticate('github'));

// GitHub will call this URL
app.get('/auth/github/callback', passport.authenticate('github', {
	failureRedirect: '/'
}),
function (req, res) {
	// res.redirect('/');
	// dump the user for debugging
	if (req.isAuthenticated()) {
		let html = '<p>authenticated as user:</p>';
		html += '<pre>' + JSON.stringify(req.user, null, 4) + '</pre>';
		res.send(html);
	}
}
);

function ensureAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		// req.user is available for use here
		return next();
	}

	// denied. redirect to login
	res.redirect('/');
}

app.get('/logout', function (req, res) {
	logger.info('logging out');
	req.logout();
	res.redirect('/');
});

//Not sure why this needs to go after but ¯\_(ツ)_/¯

app.use(Celebrate.errors());
module.exports = app;