const app = require('./app.js');
const logger = require('./utilities/logger.js');

var server;
if (process.env.NODE_ENV === 'production') {
	server = app.listen(process.env.PORT || 9145, function () {
		logger.info('Production Server listening on port ' + process.env.PORT || 9145);
		process.env.DOMAIN = 'https://linkmelater.win';
	});
} else {
	var pem = require('pem');
	var https = require('https');
	logger.info('Server listening on port ' + process.env.PORT || 9145);
	pem.createCertificate({
		days: 1,
		selfSigned: true
	}, function (err, keys) {
		if (err) {
			throw err;
		}
		server = https.createServer({
			key: keys.serviceKey,
			cert: keys.certificate
		}, app).listen(process.env.PORT || 9145, function () {
			process.env.DOMAIN = 'https://localhost:' + process.env.PORT;
		});
	});
}

module.exports = server;