var express = require('express');
var cors = require('cors');
require('dotenv').config();
var sync = require('synchronize');
var app = express();
var bodyParser = require('body-parser');


// Imports the Google Cloud client library
const Datastore = require('@google-cloud/datastore');

// Your Google Cloud Platform project ID
const projectId = 'tabmailer-174400';

// Instantiates a client
const datastoreClient = Datastore({
    projectId: projectId
});

if (process.env.NODE_ENV === 'development') {
    var config = {
        projectId: 'tabmailer-174400',
        keyFilename: '/keys/tabmailer-946de2b4591a.json'
    };

}

// Use fibers in all routes so we can use sync.await() to make async code easier to work with.
app.use(function(req, res, next) {
    sync.fiber(next);
});
app.use(bodyParser.json()); // for parsing application/json


app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.post('/savelink', function(req, res) {
    console.log(req.body.tab_url);


    var query = datastoreClient.createQuery('tabmailer_user');
    query.filter('username', 'dan');
    datastoreClient.runQuery(query, function(err, entities) {
        var firstEntity = entities[0];
        console.log(firstEntity);

        firstEntity['article_list'].push(req.body['tab_url']);
        datastoreClient.update(firstEntity)
            .then(() => {
                // Task updated successfully.
                console.log(firstEntity);
                res.send(firstEntity);
            });
    });
});

app.get('/savelink', function(req, res) {
    var query = datastoreClient.createQuery('tabmailer_user');
    query.filter('username', 'dan');
    datastoreClient.runQuery(query, function(err, entities) {

        var firstEntityKey = entities[0];
        console.log(firstEntityKey);
        res.send(firstEntityKey);
    });
});

app.get('/', function(req, res) {
    res.send('get request to homepage');
});

if (process.env.NODE_ENV === 'production') {
    app.listen(process.env.PORT || 9145);
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
        }, app).listen(process.env.PORT || 9145);
    });
}
