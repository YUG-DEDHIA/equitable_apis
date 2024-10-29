const jwt = require('jsonwebtoken');
const User = require('../models/User');

const userAuth = async (req, res, next) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1]; 

    if (!token) {
      throw new Error('Token not found in authorization header');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ _id: decoded._id });

    if (!user) {
      throw new Error('User not found');
    }

    req.user = user; 
    req.token = token;   

    next(); 
  } catch (error) {
    console.error('Error during authentication:', error);
    res.status(401).send({ error: 'Please authenticate using a valid token.' });
  }
};

module.exports = userAuth;
