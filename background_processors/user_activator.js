var mail_sender = require('./mail_sender.js');
require('dotenv').config();
const os = require('os');

var user_activator = {

	sendUserActivationEmail: function(entity){

		var hash = entity.data.user_hash;
		var env = os.hostname();
		var activation_url= "https://"+env+"/activateUser/user?="+hash;

		var email_body= "please visit the following link to activate your account: " + activation_url;
		var email_subject = "TabMailer Activation";

		mail_sender.sendEmail(entity.data.emailaddress, email_subject, email_body);
	}
}








module.exports = user_activator;








