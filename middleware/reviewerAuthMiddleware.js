const jwt = require('jsonwebtoken');
const Reviewer = require('../models/Reviewer');

const reviewerAuth = async (req, res, next) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1]; 

    if (!token) {
      throw new Error('Token not found in authorization header');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const reviewer = await Reviewer.findOne({ _id: decoded._id });

    if (!reviewer) {
      throw new Error('Reviewer not found');
    }

    req.user = reviewer; 
    req.token = token;   

    next(); 
  } catch (error) {
    console.error('Error during authentication:', error);
    res.status(401).send({ error: 'Please authenticate using a valid token.' });
  }
};

module.exports = reviewerAuth;
