require('dotenv').config();
var cron = require('cron');
var datastore_interface = require('../utilities/datastore_interface');
const util = require('util');
const _ = require('underscore');
var mail_sender = require('./mail_sender.js');



// var testJob = new cron.CronJob('* * * * * *', function() {
//     console.log('You will see this message every second');
// }, null, true, 'America/Los_Angeles');
var sendSavedArticles = new cron.CronJob('* * * * * *', function() {

    var proceed = function(users) {
        var usersWithArticles = _.reject(users, function(user) { return (user.article_list.length === 0); });

        _.each(usersWithArticles, function(user) {

            var indicesToDrop = [];
            _.each(user.article_list, function(article) {

                // Article is at least a day old
                console.log("Article List: " + util.inspect(user.article_list) + "\n");
                console.log("Article " + util.inspect(article) + "\n");
                if (article.datetime_added < (Date.now() - 86400000)) {

                    var sendit = Math.floor(Math.random() * 7) + 1;
                    if (sendit === 7) {

                        console.log('QUEUEING EMAIL');
                        var tabmailBody = 'You asked us to save the following link: ' + article.article_url + ' . There it is!';
                        if (process.env.LIVE_EMAIL) {
                            mail_sender.sendEmail(user.emailaddress, 'Your TabMailer Link!', tabmailBody);
                        }

                        indicesToDrop.push(user.article_list.indexOf(article));
                    }
                }
            });
            for (i = 0; i < indicesToDrop.length; i++) {
                user.article_list.splice(indicesToDrop[i], 1);
            }
            // console.log("Article List AFTER: " + util.inspect(user.article_list) + "\n");
            datastore_interface.setValueForProperty(user, 'article_list', user.article_list, function(updatedUser) {
                console.log('Updated User: \n' + util.inspect(updatedUser) + '\n');
            });
        });

    }

    datastore_interface.fetchAllActivatedUsers(proceed);
}, null, true, 'America/Los_Angeles');



var cron_functions = {
    scheduleAllJobs: function() {
        sendSavedArticles.start();
    }
}
module.exports = cron_functions;