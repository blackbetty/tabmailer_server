require('dotenv').config();
if (process.env.ENABLE_HONEYCOMB == 'true') {
	require('honeycomb-beeline')({
		writeKey: process.env.HONEYCOMB_API_KEY
		/* ... additional optional configuration ... */
	});
}
const app = require('./app.js');

const logger = require('./utilities/logger.js');
const fs = require('fs');
var server;
if (process.env.NODE_ENV === 'production') {
	server = app.listen(process.env.PORT || 9145, function() {
		logger.info('Production Server listening on port ' + process.env.PORT || 9145);
		process.env.DOMAIN = 'https://linkmelater.win';
	});
} else {
	var https = require('https');
	logger.info('Server listening on port ' + process.env.PORT || 9145);

	try {
		server = https.createServer({
			key: fs.readFileSync('./keys/local_ssl/key.pem'),
			cert: fs.readFileSync('./keys/local_ssl/cert.pem'),
			passphrase: process.env.SSL_CERT_PASSPHRASE
		}, app).listen(process.env.PORT || 9145, function() {
			process.env.DOMAIN = 'https://localhost:' + process.env.PORT;
		});
	} catch (error) {
		logger.error(`Error spinning up local server ${error}`);
	}


}

module.exports = server;