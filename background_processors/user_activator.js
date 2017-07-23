var mail_sender = require('./mail_sender.js');

var user_activator = {

	sendUserActivationEmail: function(entity){

		var hash = entity.data.user_hash;
		var activation_url= "https://"+env+"/activateUser/user?="+hash;

		var email_body= "please visit the following link to activate your account: " + activation_url;
		var email_subject = "TabMailer Activation";
		mail_sender.sendEmail(entity.data.emailaddress, email_subject, email_str);
	}
}








module.exports = user_activator;








