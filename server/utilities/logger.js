const fs = require('fs');
var winston = require('winston');
winston.emitErrs = true;




const logDir = './logs';
// Create the log directory if it does not exist
if (!fs.existsSync(logDir)) {
	// console.log('CWD +++++++++++++++++++++' + process.cwd());
	// console.log('CREATING LOG DIR+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+__+');
	fs.mkdirSync(logDir);
}

const tsFormat = () => (new Date()).toLocaleTimeString();
const logger = new(winston.Logger)({
	transports: [
		// colorize the output to the console
		new(winston.transports.Console)({
			timestamp: tsFormat,
			colorize: true,
			prettyPrint: true,
			level: process.env.LOG_LEVEL
		})//,
		// new(require('winston-daily-rotate-file'))({ breaks in production so removing it for now
		//     filename: './'+logDir+'/-filelog-router.log',
		//     datePattern: 'yyyy-MM-dd',
		//     timestamp: tsFormat,
		//     prepend: true,
		//     colorize: true,
		//     level: env == 'development' ? 'silly' : 'info'
		// })
	]
});

module.exports = logger;
module.exports.stream = {
	write: function(message){
		logger.info(message);
	}
};