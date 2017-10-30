require('dotenv').config();
var cron = require('cron');


const sendSavedLinksJob = require('./cron_jobs/send_saved_articles_job.js');


var cron_functions = {
    scheduleAllJobs: function() {
        sendSavedLinksJob.start();
    }
}
module.exports = cron_functions;