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
var getLinksForUser = require('./controllers/private/get_links_for_user.js');
var getSettingsForUser = require('./route_handlers/getsettingsforuser.js');
var saveLink = require('./route_handlers/savelink.js');
var resetSettingsChangedAttrib = require('./route_handlers/reset_settings_changed_attrib.js');
var updateEmailForUser = require('./route_handlers/update_email_for_user.js');
var updateSettingsForUser = require('./route_handlers/updatesettingsforuser.js');
var createUser = require('./controllers/private/create_user.js');
const authMiddleware = require('./middleware/auth_middleware');
const {
	activateUser: activateUserRoute,
	auth: ppAuth
} = require('./controllers/public/');

// Background Processors
var user_activator = require('./background_processors/user_activator.js');
var cron_functions = require('./background_processors/cron_functions.js');

// Utilities
const logger = require('./utilities/logger.js');
// Router Utilities


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

const protectedRouter = express.Router();
const publicRouter = express.Router();
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

// Passport

// publicRouter.get('/logout', ppAuth.logout);

protectedRouter.use(session({
	secret: process.env.PP_SESSION_SECRET,
	resave: true,
	saveUninitialized: true
}));
protectedRouter.use(passport.initialize());
protectedRouter.use(passport.session());


publicRouter.use(session({
	secret: process.env.PP_SESSION_SECRET
}));
publicRouter.use(passport.initialize());
publicRouter.use(passport.session());


publicRouter.get('/auth/github', ppAuth.providers.github.authenticate(passport));
publicRouter.get('/auth/google', ppAuth.providers.google.authenticate(passport, this.req, this.res));
publicRouter.get('/auth/github/callback', ...(ppAuth.providers.github.callback(passport)));
publicRouter.get('/auth/google/callback', ...(ppAuth.providers.google.callback(passport)));

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

publicRouter.get('/', function (req, res) {
	if (req.headers['user-agent'] != 'GoogleStackdriverMonitoring-UptimeChecks(https://cloud.google.com/monitoring)') logger.info('GET received... \tHomepage ');
	if (req.user) res.redirect('/dashboard');
	res.sendFile(path.join(__dirname + '/pages/views/home.html'));
});

publicRouter.get('/signup', function (req, res) {
	logger.info('GET received... \tSignup ');
	res.sendFile(path.join(__dirname + '/pages/views/home.html'));
});

publicRouter.get('/login', function (req, res) {
	logger.info('GET received... \tlogin ');
	if (req.user) {
		res.redirect('/dashboard');
		return;
	}
	res.sendFile(path.join(__dirname + '/pages/views/login/login.html'));
});

publicRouter.get('/login/modal', function (req, res) {
	logger.info('GET received... \tlogin modal');
	res.sendFile(path.join(__dirname + '/pages/views/login/login.html'));
});

protectedRouter.get('/dashboard', function (req, res) {
	if (req.user) {
		logger.info('GET received... \tDashboard ');
		res.sendFile(path.join(__dirname + '/pages/views/dashboard/dashboard.html'));
	} else {
		res.redirect('/login');
	}
});


publicRouter.get('/activate/:userHash', Celebrate({
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
 * User CRUD Routes
 *
 */


publicRouter.post('/users/', Celebrate({
	body: SCHEMA_POST_CREATEUSER
}), async (req, res) => {
	logger.info('POST received... \tCreateUser');
	const check = req.isAuthenticated();
	let status_code = 400;
	let res_val = 'Generic error, something went wrong while creating a user';
	try {
		// can be false or The Entity
		const userRecordEntity = await createUser(req.body.emailaddress, req.body.username, req.user.id, req.user.oauth_provider);
		logger.silly(userRecordEntity);

		logger.debug('Google ID', {
			authID: req.user.id
		});

		if (userRecordEntity.error) {
			logger.error(userRecordEntity.error);
			status_code = 400;
			res_val = 'A user for that Google Account already exists, please go to your existing dashboard';
		} else {
			status_code = 200;
			res_val = userRecordEntity;
		}
	} catch (error) {
		logger.error(`POST ERROR: Creating a user for ${req.user.id || 'USER ID NULL'} failed`);
		status_code = 500;
		res_val = `Internal Error:\n\t Creating user failed ${error}`;
	}

	res.status(status_code).send(res_val);
});

/*
 *
 * Link CRUD Routes
 *
 */

protectedRouter.post('/linksforuser', Celebrate({
	body: SCHEMA_POST_LINKS
}), (req, res) => {
	logger.info('POST received... \tLinksForUser');
	if (req.user) {
		executeLinkCollectionUpdate(req.user.id);
	} else {
		res.status(401).send();
	}

	function executeLinkCollectionUpdate(userID) {
		saveLink(userID, req.body.tab_url, req.body.tab_title, function (err, userEntity) {
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
});

protectedRouter.get('/links', Celebrate({
	query: SCHEMA_GET_LINKS
}), async (req, res) => {
	logger.info('GET received... \tLinksForUser');

	const link_array = await getLinksForUser(req.user.id);


	Joi.validate(link_array, SCHEMA_RES_LINKS).then((link_array) => {

		var log_msg = link_array[0] ? 'User fetch completed for user: ' + link_array[0].user_id : 'User link collection empty';
		logger.debug(log_msg);
		logger.silly(link_array);
		res.send(link_array);
	}).catch((reason) => res.status(400).send(`Something appears to be wrong with this account: ${reason}`));

});


/*
 *
 * Settings CRUD Routes
 *
 */

protectedRouter.get('/settings', Celebrate({
	query: SCHEMA_GET_SETTINGS
}), (req, res) => {

	logger.info('GET received... \tSettings ');

	getSettingsForUser(req.user.id, function (err, settings) {
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

});

protectedRouter.post('/settings', Celebrate({
	body: SCHEMA_POST_SETTINGS
}), async (req, res) => {

	logger.debug('POST received... \tSettings');
	let settings;
	let status_code = 404;
	let res_val = 'User with that ID not found';
	try {
		settings = await updateSettingsForUser(req.user_id, req.body[req.body.newKey], req.body.newKey);
		logger.silly(settings);
		status_code = 200;
		res_val = settings;
	} catch (error) {
		logger.error(`POST ERROR: Saving settings for user ${req.user_id || 'USER ID NULL'} failed`);
		res.status(500).send(`Internal Error:\n\t Saving settings failed ${error}`);
		status_code = 500;
		res_val = error;
	}

	res.status(status_code).send(res_val);
});



protectedRouter.post('/email', Celebrate({
	body: SCHEMA_POST_EMAIL
}), (req, res) => {

	logger.info('POST received... \tEmail');

	updateEmailForUser(req.user_id, req.body.emailaddress, function (userEntity) {
		if (!userEntity) {
			res.status(404).send('No user exists for that ID or an unknown error occurred');
		} else {
			res.status(200).send(userEntity);
		}
	});
});

//Not sure why this needs to go after but ¯\_(ツ)_/¯


app.use('/', publicRouter);
app.use('/', protectedRouter);
app.use(Celebrate.errors());
module.exports = app;