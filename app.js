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


// // The kind for the new entity
// const kind = 'Task';
// // The name/ID for the new entity
// const name = 'sampletask1';
// // The Cloud Datastore key for the new entity
// const taskKey = datastore.key([kind, name]);

// // Prepares the new entity
// const task = {
//   key: taskKey,
//   data: {
//     description: 'Buy milk'
//   }
// };

// // Saves the entity
// datastore.save(task)
//   .then(() => {
//     console.log(`Saved ${task.key.name}: ${task.data.description}`);
//   })
//   .catch((err) => {
//     console.error('ERROR:', err);
//   });


var key = datastoreClient.key(['tabmailer_user', 'dan']);

datastoreClient.get(key, function(err, entity) {
  console.log(err || entity);
});








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
    res.sendStatus(200);
});

app.get('/savelink', function(req, res) {
    res.send('get request to link page');
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
