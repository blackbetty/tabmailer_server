const Datastore = require('@google-cloud/datastore');
var hash = require('object-hash');
var logger = require('./logger.js');


// Refactor this into its own file later
// *****************************************************************

const projectId = 'tabmailer-174400';

// Instantiates a client
const datastoreClient = Datastore({
    projectId: projectId
});

if (process.env.NODE_ENV === 'development') {
    var config = {
        projectId: projectId,
        keyFilename: '../keys/tabmailer-946de2b4591a.json'
    };
}


// *****************************************************************

var datastore_interface = {

    fetchUserForPropertyAndValue: function(property, value, callback) {

        var query = datastoreClient.createQuery('tabmailer_user');
        query = query.filter(property, '=', value);
        datastoreClient.runQuery(query, function(err, entities) {
            var userEntities = entities;
            if (!userEntities) {
                callback(false); // no user found
            } else {
                callback(userEntities);
            }
        });
    },
    fetchAllActivatedUsers: function(callback) {

        var query = datastoreClient.createQuery('tabmailer_user')
        query = query.filter('activated', true);

        datastoreClient.runQuery(query, function(err, entities) {
            var userEntities = entities;

            if (!userEntities) {
                callback(false); // no user found
            } else {
                callback(userEntities);
            }
        });
    },
    setValueForProperty(user, property, value, callback) {
        user[property] = value;
        datastoreClient.update(user)
            .then(() => {
                callback(user);
            });
    }
}

module.exports = datastore_interface;