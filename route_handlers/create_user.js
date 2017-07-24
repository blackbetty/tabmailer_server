const Datastore = require('@google-cloud/datastore');
var hash = require('object-hash');
var user_activator = require('../background_processors/user_activator.js');
require('dotenv').config();


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


module.exports = function(emailaddress, username, password, callback) {
    var query = datastoreClient.createQuery('tabmailer_user').limit(1);;

    //fix this later to use authkey
    query.filter('username', username);


    datastoreClient.runQuery(query, function(err, entities) {
        var userEntity = entities[0];
        if (userEntity) {
            callback(false); // a user for this username already exists
        } else {
            var userKey = {
                kind: 'tabmailer_user'
            }

            var user = {
                emailaddress: emailaddress,
                username: username,
                password: hash(password),
                article_list: [],
                activated: false
            };
            user.user_hash = hash(user);

            const entity = {
                key: userKey,
                data: user
            };

            datastoreClient.insert(entity)
                .then(() => {
                    // Task inserted successfully

                    user_activator.sendUserActivationEmail(entity);
                    callback(entity);
                });
        }
    });

};
