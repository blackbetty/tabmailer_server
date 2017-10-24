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


module.exports = function(googleUserID, newSettings, callback) {
    var query = datastoreClient.createQuery('tabmailer_user').limit(1);


    query.filter('google_user_id', googleUserID);


    datastoreClient.runQuery(query, function(err, entities) {
        var userEntity = entities[0];
        var article_entity = {
            article_url: tab_url,
            article_title: tab_title,
            datetime_added: Date.now() //,
            // saved_article_id: Math.floor(Math.random() * 10000000000000000);
        }


        // this line is what gets updated
        userEntity['article_list'].push(article_entity);



        datastoreClient.update(userEntity)
            .then(() => {
                // Task updated successfully.
                if (process.env.DEVMODE) {
                    console.log(userEntity);
                }
                callback(userEntity);
            });
    });
}