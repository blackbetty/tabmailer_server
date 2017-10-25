const Datastore = require('@google-cloud/datastore');
const user_activator = require('../background_processors/user_activator.js');
var hash = require('object-hash');


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


module.exports = function(googleUserID, newEmail, callback) {
    var query = datastoreClient.createQuery('tabmailer_user').limit(1);


    query.filter('google_user_id', googleUserID);


    datastoreClient.runQuery(query, function(err, entities) {
        var userEntity = entities[0];

        userEntity['emailaddress'] = newEmail;
        console.log(userEntity.emailaddress);
        userEntity['activated'] = false;
        userEntity.user_hash = hash(userEntity);
        datastoreClient.update(userEntity)
            .then(() => {



                // some stupid bullshit for the method signature
                var userKey = {
                    kind: 'tabmailer_user'
                }

                const activationEntity = {
                    key: userKey,
                    data: userEntity
                };




                user_activator.sendUserActivationEmail(activationEntity);
                console.log('userEntity2');
                callback(userEntity);
            }).catch(function(reason) {
                console.log("Promise Rejected because: " + reason);
            });
    });
}