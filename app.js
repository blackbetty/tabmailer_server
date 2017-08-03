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
var saveLink = require('./route_handlers/savelink.js');
var getLinksForUser = require('./route_handlers/getlinksforuser.js');
var createUser = require('./route_handlers/create_user.js');
var path = require('path');
var user_activator = require('./background_processors/user_activator.js');
var request = require('request');



// Use fibers in all routes so we can use sync.await() to make async code easier to work with.
app.use(function(req, res, next) {
    sync.fiber(next);
});



app.use('/pages', express.static(__dirname + '/pages'));

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }));

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get('/', function(req, res) {
    res.send('get request to homepage');
});



// User CRUD routes
app.get('/signup', function(req, res) {
    res.sendFile(path.join(__dirname + '/pages/views/signup.html'));
});

app.post('/createUser', function(req, res) {
    if (!req.body.gapi_token) {
        console.log(req.body)
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
                console.log("GOOGLE AUTH userid: " + userid);
                res.send(value);
            });
        });
});



app.get('/activateUser/:userHash', function(req, res) {
    if (!req.params.userHash) {
        res.sendStatus(404);
    } else {
        var userHash = req.params.userHash; // not a user object, just the userHash to be activated
        user_activator.activateUser(userHash, function(err, userObject) {
            if (!err) {
                console.log("No error!!");
                res.send(userObject);
            }
        });
    }
});



// Link CRUD Routes

app.post('/linksforuser', function(req, res) {
    if (!req.body.google_auth_token) {
        console.log(req.body)
        res.status(400).send('No Google Auth Token Received: ' + req.body);
        return;
    }

    // Raw call is bad, but I don't know how to do this via the Library and the docs aren't helping
    var options = {
        url: 'https://www.googleapis.com/oauth2/v1/userinfo',
        headers: {
            'Authorization': 'Bearer ' + req.body.google_auth_token,
            'Content-Type': 'application/json'
        }
    };


    request(options, function(error, response, body) {

        body = JSON.parse(body);

        var googleUserID = body.id;

        saveLink(googleUserID, req.body.tab_url, function(userEntity) {
            // res.sendStatus(200);
            console.log('----------------' + req.body.tab_url)
            res.send(req.body.tab_url);
        });

    });
});

app.get('/linksforuser', function(req, res) {

    // since I don't have auth yet, this val isn't used
    // we just default to my user
    var auth_key = 'notyet';
    getLinksForUser(auth_key, function(userEntity) {
        res.send(userEntity);
    });
});




if (process.env.NODE_ENV === 'production') {
    app.listen(process.env.PORT || 9145, function() {
        process.env.DOMAIN = /*'https://'+*/ process.env.PROJECTID + '.appspot.com';
    });
} else {
    var pem = require('pem');
    var https = require('https');
    console.log("Server listening on port " + process.env.PORT || 9145);
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