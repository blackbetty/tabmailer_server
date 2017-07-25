require('dotenv').config();


var express = require('express');
var cors = require('cors');
var sync = require('synchronize');
var app = express();
var bodyParser = require('body-parser');
var saveLink = require('./route_handlers/savelink.js');
var getLinksForUser = require('./route_handlers/getlinksforuser.js');
var createUser = require('./route_handlers/create_user.js');
var path = require('path');



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
    createUser(req.body.emailaddress, req.body.username, req.body.password, function(value) {
        // can be false or The Entity
        res.send(value);
    });
});
// app.get('/createUser', function(req, res) {
//     res.sendFile(path.join(__dirname + '/pages/views/createUser.html'));
// });


app.get('/activateUser/', function(req, res) {
    if (!req.params.user) {
        res.sendStatus(404);
    } else {
        // user_activator.activateUser(req.params.user, function(username) {
        //     res.send("user activated!");
        // });
    }
});



// Link CRUD Routes

app.post('/linksforuser', function(req, res) {
    saveLink(req.body.auth_key, req.body.tab_url, function(userEntity) {
        res.sendStatus(200);
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
        console.log(this.address());
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
            console.log(this.address());
        });
        // console.log(https.Server.address);
    });
}
