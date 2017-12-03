const logger = require('./logger.js');
require('dotenv').config();


var conninfo;
if(process.env.NODE_ENV === 'production'){
	conninfo = {
		host: process.env.PROD_DB_IP,
		user: process.env.PROD_DB_USER,
		password: process.env.PROD_DB_PW,
		database: 'tabmailer_db'
	};
} else {
	conninfo = {
		host: 'localhost',
		user: 'Dan',
		password:'',
		database:'tabmailer_db'
	};
}

var knex = require('knex')({
	client: 'pg',
	connection: conninfo
});

logger.info(`Searching for database @ ${conninfo.host}:5432/${conninfo.database}`);
module.exports = knex;