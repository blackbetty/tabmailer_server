const Datastore = require('@google-cloud/datastore');


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



module.exports = function(googleUserID, callback) {
    var query = datastoreClient.createQuery('tabmailer_user').limit(1);

    // switch this for authKey later
    query.filter('google_user_id', googleUserID);


    datastoreClient.runQuery(query, function(err, entities) {
        var userEntity = entities[0];
        if (process.env.DEVMODE === 'true') {
            console.log(userEntity);
        }
        callback(userEntity);
    });
}
