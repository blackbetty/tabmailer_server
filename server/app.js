require('dotenv').config();
var GoogleAuth = require('google-auth-library');
var auth = new GoogleAuth;
var gapiClient = new auth.OAuth2(process.env.GAPI_CLIENT_ID, '', '');
const util = require('util');
var express = require('express');
var cors = require('cors');
var sync = require('synchronize');
var app = express();
var bodyParser = require('body-parser');
var path = require('path');
var httpsRedirect = require('express-https-redirect');
const env = process.env.NODE_ENV || 'development';
const Celebrate = require('celebrate');
const { Joi } = Celebrate;



// Route Handlers
var saveLink = require('./route_handlers/savelink.js');
var getLinksForUser = require('./route_handlers/getlinksforuser.js');
var getSettingsForUser = require('./route_handlers/getsettingsforuser.js');
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





// Use fibers in all routes so we can use sync.await() to make async code easier to work with.
app.use(function(req, res, next) {
    sync.fiber(next);
});

app.use('/', httpsRedirect());

cron_functions.scheduleAllJobs();

app.use('/pages', express.static(__dirname + '/pages'));
app.use(Celebrate.errors());


app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }));

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});


// Page routes
app.get('/', function(req, res) {
    logger.info("GET received... \tHomepage ");
    res.sendFile(path.join(__dirname + '/pages/views/home.html'));
});

app.get('/signup', function(req, res) {
    logger.info("GET received... \tSignup ");
    res.sendFile(path.join(__dirname + '/pages/views/home.html'));
});

app.get('/dashboard', function(req, res) {
    logger.info("GET received... \tDashboard ");
    res.sendFile(path.join(__dirname + '/pages/views/dashboard/dashboard.html'));
});


// User CRUD routes
app.post('/createUser', function(req, res) {

    logger.info("POST received... \tCreateUser");
    if (!req.body.gapi_token) {
        logger.warn('USER CREATION FAILED: NO GOOGLE ID', {
            request_body: req.body
        });
        res.status(400).send('No Google ID Token Received: ' + req.body);
        return;
    }
    gapiClient.verifyIdToken(
        req.body.gapi_token,
        process.env.GAPI_CLIENT_ID,
        function(e, login) {
            if (e) {
                res.status(500).send('Something broke!: ' + e);
                return;
            }
            var payload = login.getPayload();
            var userid = payload['sub'];

            // pass in and store the Google User ID
            createUser(req.body.emailaddress, req.body.username, userid, function(value) {
                // can be false or The Entity
                logger.debug('Google ID', {
                    authID: userid
                })
                res.send(value);
            });
        });
});

app.get('/activateUser/:userHash', function(req, res) {

    logger.info("GET received... \tActivateUser ");
    if (!req.params.userHash) {
        // if we don't get a user hash, the page doesn't exist :)
        res.sendStatus(404);
        logger.warn('USER ACTIVATION FAILED: NO HASH PROVIDED');
    } else {
        var userHash = req.params.userHash; // not a user object, just the userHash to be activated
        user_activator.activateUser(userHash, function(err, userObject) {
            if (!err) {
                logger.info('USER ACTIVATED SUCCESSFULLY', {
                    user: userObject
                })
                res.cookie('tabmailer_data', JSON.stringify(userObject.user_hash));
                res.sendFile(path.join(__dirname + '/pages/views/activation/activation.html'));
                // res.end();
            } else {
                // if the user activation failed,
                // for example if the hash provided was invalid,
                // we just don't return a cookie, which the UI takes as meaning the activation failed.
                logger.info('USER ACTIVATION FAILED FOR USERHASH ' + userHash, {
                    error: err
                })
                res.sendFile(path.join(__dirname + '/pages/views/activation/activation.html'));
            }
        });
    }
});



// Link CRUD Routes



/*
 * Saves a link for the given user
 *
 *
 */

app.post('/linksforuser', Celebrate({ body: SCHEMA_POST_LINKS }), (req, res) => {
    // fuck you google and your stupid auth system in chrome extension
    logger.silly('Any errors here are Google and their OAuth implentation for CRX\'s fault');
    if (req.body.google_access_token) {
        getGoogleIDForAccessToken()
        .then((uID) =>{
            executeLinkCollectionUpdate(uID);
        })
        .catch((e)=>{
            errorResponse(e, "Failed to fetch googleUserID for the given access_token: ");
        })
    } else {
        getGoogleIDForIDToken(req.body.google_id_token)
        .then((uID)=>{
            executeLinkCollectionUpdate(uID);
        }).catch((e)=>{
            errorResponse(e, "Failed to fetch googleUserID for the given id_token: ");
        })
    }

    var executeLinkCollectionUpdate = function(googleUserID) {
        saveLink(googleUserID, req.body.tab_url, req.body.tab_title, function(userEntity) {
            logger.silly('User link post succeeded calling callback', {
                tab_url: req.body.tab_url
            });

            if (userEntity.settingsChanged == true) {
                // if its true send an object that contains a url and the settings object
                resetSettingsChangedAttrib(userEntity.google_user_id);
                res.send({
                    saved_url: req.body.tab_url,
                    newSettings: userEntity.settings
                });
            } else {
                res.send({ saved_url: req.body.tab_url });
            }

        });
    }
    var errorResponse = function(error, message){
        logger.warn (message, { error_body: error } );
        res.status(500).send(`Internal Error:\n\t${message} ${error}`);
    }
});



/*
 * Gets links/tabs for the given user
 *
 *
 */

app.get('/linksforuser', Celebrate({
    query: { google_id_token: Joi.string().required() }
}), (req, res) => {

    gapiClient.verifyIdToken(
        req.query.google_id_token,
        process.env.GAPI_CLIENT_ID,
        function(e, login) {

            const value = { e: e, login: login };
            const schema = { e: Joi.any().valid(null), login: Joi.object() };

            Joi.validate(value, schema)

                .then((success) => {

                    var payload = login.getPayload();
                    Joi.validate({ payload_errors: payload.errors }, { payload_errors: Joi.any().valid(null) })

                        .then((success) => {
                            executeGetForID(payload['sub'])
                        })
                        .catch((reason) => {
                            logValidationPromiseRejection("Google UserID Response Body Error Present: ", reason, payload.errors, payload);
                            res.status(400).send(payload.errors);
                        });

                })
                .catch((reason) => {
                    logValidationPromiseRejection("Link Collection Fetch Request Error: ", reason, e, login);
                    res.status(400).send(e);
                });
        }
    );

    function executeGetForID(userID) {
        getLinksForUser(userID, function(userEntity) {
            logger.debug("User fetch completed for user: " + userEntity.username);
            logger.silly(userEntity);
            res.send(userEntity);
        });
    }

    function logValidationPromiseRejection(causeString, reason, errorObject, fullObject) {
        logger.warn(causeString + reason);
        logger.debug(causeString + errorObject);
        logger.silly(causeString + fullObject);
    }
});





// Settings CRUD Routes


// Read
app.get('/settings', function(req, res) {

    logger.info('GET received... \tSettings ');

    if (!req.query.google_auth_token) {

        logger.warn('USER SETTINGS GET FAILED: NO AUTH TOKEN', {
            'request-body': util.inspect(req.body),
            'request-query': util.inspect(req.query)
        })
        res.status(400).send('No Google Auth Token Received');
        return;
    }

    gapiClient.verifyIdToken(
        req.query.google_auth_token,
        process.env.GAPI_CLIENT_ID,
        function(e, login) {
            if (e) {
                logger.warn("Settings Fetch Request Error: " + e);
                logger.silly(login);
                res.status(400).send(e);
            }
            var payload = login.getPayload();


            if (payload.errors) {
                logger.warn('GOOGLE USER ID REQ RESPONSE BODY ERROR PRESENT', {
                    'response-body': util.inspect(payload),
                    'response-errors': util.inspect(payload.errors)
                })
                res.status(400).send(payload.errors);
            }

            var googleUserID = payload['sub'];

            getSettingsForUser(googleUserID, function(userEntity) {
                logger.debug("User fetched for user settings request");
                logger.silly(userEntity);

                // because I didn't include a settings object to start now we have to control for it somehow
                // they'll be created by the UI every time the settings are updated, so if they're empty we
                // just create a default one
                if (!userEntity) {
                    res.status(404).send('No user exists for that ID');
                } else if (!userEntity['settings']) {
                    logger.debug('Settings object didn\'t exist for user, returning empty obj JSON');
                    res.status(200).send('{}');
                } else if (Object.keys(userEntity['settings']).length === 0 && userEntity['settings'].constructor === Object) {
                    logger.debug('Settings object for user was empty, returning empty obj JSON');
                    res.status(200).send('{}');
                } else {
                    res.status(200).send(userEntity['settings']);
                }

            });
        }
    );

});

app.post('/settings', function(req, res) {

    logger.debug('POST received... \tSettings');

    var handleSettingsPostError = function(loggerError, errorBody, userFacingError) {
        logger.warning(loggerError, {
            'request-body': util.inspect(errorBody)
        })
        res.status(400).send(userFacingError);
        return;
    }

    if (!req.body.google_auth_token) {
        handleSettingsPostError(
            'USER SETTINGS POST FAILED: No Auth Token',
            req.body,
            'No Google Auth Token Received'
        );
        return;
    }

    if (!req.body.newKey) {
        handleSettingsPostError(
            'USER SETTINGS POST FAILED: No new settings specified',
            req.body,
            'No settings object received'
        );
        return;
    }

    gapiClient.verifyIdToken(
        req.body.google_auth_token,
        process.env.GAPI_CLIENT_ID,
        function(e, login) {
            var payload = login.getPayload();
            // how do I handle this more gracefully?
            if (e || payload.errors) {
                if (e && !payload.errors) {
                    logger.warning(login);
                    logger.warning("----------------SETTINGS POST REQUEST ERROR");
                    logger.warning(e)
                    res.status(400).send(e);
                } else if (payload.errors && !e) {
                    logger.debug('GOOGLE USER ID RESPONSE BODY ERROR PRESENT IN SETTINGS POST', {
                        'response-body': util.inspect(payload),
                        'response-errors': util.inspect(payload.errors)
                    })
                    res.status(400).send(payload.errors);
                } else {
                    logger.debug('Compound error in settings post auth verification', {
                        'response-body': util.inspect(payload),
                        'response-errors': util.inspect(e)
                    })
                    res.status(400).send(payload.errors);
                }
            }

            var payload = login.getPayload();

            var googleUserID = payload['sub'];

            updateSettingsForUser(googleUserID, req.body[req.body.newKey], req.body.newKey, function(userEntity) {

                // because I didn't include a settings object to start now we have to control for it somehow
                // they'll be created by the UI every time the settings are updated, so if they're empty we
                // just create a default one
                if (!userEntity) {
                    res.status(404).send('No user exists for that ID');
                } else {
                    res.status(200).send(userEntity['settings']);
                }

            });
        }
    );

});


app.post('/email', function(req, res) {

    logger.info('POST received... \tEmail');

    var handleSettingsPostError = function(loggerError, errorBody, userFacingError) {
        var errorPrefix = 'USER EMAIL UPDATE FAILED: '
        logger.debug(errorPrefix + loggerError, {
            'request-body': util.inspect(errorBody)
        })
        res.status(400).send(userFacingError);
        return;
    }

    if (!req.body.google_auth_token) {
        handleSettingsPostError(
            'No Auth Token',
            req.body,
            'No Google Auth Token Received'
        );
        return;
    }

    if (!req.body.emailaddress) {
        handleSettingsPostError(
            'No new email specified',
            req.body,
            'No email address received'
        );
        return;
    }

    gapiClient.verifyIdToken(
        req.body.google_auth_token,
        process.env.GAPI_CLIENT_ID,
        function(e, login) {
            var payload = login.getPayload();
            // how do I handle this more gracefully?
            if (e || payload.errors) {
                if (e && !payload.errors) {
                    logger.warn("Email Update Request Error: " + e);
                    logger.silly(login);
                    res.status(400).send(e);
                } else if (payload.errors && !e) {
                    logger.debug('GOOGLE USER ID RESPONSE BODY ERROR PRESENT IN EMAIL UPDATE POST', {
                        'response-body': util.inspect(payload),
                        'response-errors': util.inspect(payload.errors)
                    })
                    res.status(400).send(payload.errors);
                } else {
                    logger.debug('Compound error in email update auth verification', {
                        'response-body': util.inspect(payload),
                        'response-errors': util.inspect(e)
                    })
                    res.status(400).send(payload.errors);
                }
            }

            var payload = login.getPayload();

            var googleUserID = payload['sub'];

            updateEmailForUser(googleUserID, req.body.emailaddress, function(userEntity) {
                if (!userEntity) {
                    res.status(404).send('No user exists for that ID or an unknown error occurred');
                } else {
                    res.status(200).send(userEntity);
                }
            });
        }
    );

});


// General stuff


if (process.env.NODE_ENV === 'production') {
    app.listen(process.env.PORT || 9145, function() {
        process.env.DOMAIN = /*'https://'+*/ process.env.PROJECTID + '.appspot.com';
    });
} else {
    var pem = require('pem');
    var https = require('https');
    logger.info("Server listening on port " + process.env.PORT || 9145);
    pem.createCertificate({ days: 1, selfSigned: true }, function(err, keys) {
        if (err) {
            throw err;
        }
        https.createServer({
            key: keys.serviceKey,
            cert: keys.certificate
        }, app).listen(process.env.PORT || 9145, function() {
            process.env.DOMAIN = 'https://localhost:' + process.env.PORT;
        });
    });
}