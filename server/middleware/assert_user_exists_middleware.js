const User = require('../models/user.js');
const logger = require('../utilities/logger.js');

const assertUserExists = async (req, res, next) => {
	try{
		if(!req.user) res.send(401);
		const users = await User.findByID(req.user.id);
		if(users.length < 1) res.send(404);
		return next();
	} catch (error) {
		logger.error(error);
		res.send(500);
	}
};

module.export = assertUserExists;