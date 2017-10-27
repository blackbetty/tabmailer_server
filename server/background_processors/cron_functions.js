require('dotenv').config();
var cron = require('cron');
var datastore_interface = require('../utilities/datastore_interface');
const util = require('util');
const _ = require('underscore');
var mail_sender = require('./mail_sender.js');
var moment = require('moment');


var sendSavedArticles = new cron.CronJob('0 0 * * *', function() {

    var proceed = function(users) {
        var usersWithArticles = _.reject(users, function(user) { return (user.article_list.length === 0); });

        _.each(usersWithArticles, function(user) {

            var indicesToDrop = [];
            _.each(user.article_list, function(article) {

                // Article is at least a day old
                if (article.datetime_added < (Date.now() - 86400000)) {
                    var sendit = Math.floor(Math.random() * 7) + 1;
                    console.log('For user [' + user.emailaddress + '] sendit var is ' + sendit);
                    if (sendit === 7) {

                        console.log('QUEUEING EMAIL FOR USER' + user.emailaddress);
                        var tabmailBody = 'You asked us to save the following link: ' + article.article_url + ' . There it is!';
                        if (process.env.LIVE_EMAIL) {
                            var today = moment().format("dddd, MMMM Do, YYYY");

                            mail_sender.sendEmail(user.emailaddress, 'Your TabMailer Link For '+ today, tabmailBody);
                        }

                        indicesToDrop.push(user.article_list.indexOf(article));
                    }
                }
            });
            for (i = 0; i < indicesToDrop.length; i++) {
                user.article_list.splice(indicesToDrop[i], 1);
            }

            datastore_interface.setValueForProperty(user, 'article_list', user.article_list, function(updatedUser) {
                if (process.env.DEVMODE) {

                    console.log('Updated User: \n' + util.inspect(updatedUser) + '\n');
                }
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