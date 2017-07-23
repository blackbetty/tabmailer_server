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


module.exports = function(userAuthKey, url, callback) {
    var query = datastoreClient.createQuery('tabmailer_user').limit(1);;

    //fix this later to use authkey
    query.filter('username', 'dan');


    datastoreClient.runQuery(query, function(err, entities) {
        var userEntity = entities[0];
        userEntity['article_list'].push(url);
        console.log("Pre update " + process.env.DEVMODE);
        datastoreClient.update(userEntity)
            .then(() => {
                // Task updated successfully.
                if(process.env.DEVMODE){
                	console.log(userEntity);
                }
                callback(userEntity);
            });
    });
}

