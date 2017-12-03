require('dotenv').config();
var cron = require('cron');


const sendSavedLinksJob = require('./cron_jobs/send_saved_articles_job.js');


var cron_functions = {
	scheduleAllJobs: function() {
		// new cron.CronJob('0 0 * * *', sendSavedLinksJob, null, true, 'America/Los_Angeles').start();
		new cron.CronJob('* * * * *', sendSavedLinksJob, null, true, 'America/Los_Angeles').start(); // minutely setting for testing
	}
};

module.exports = cron_functions;