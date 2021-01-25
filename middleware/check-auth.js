const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.decode(token);
    req.userID=decodedToken.userID
    const email = decodedToken.email;
    if (req.body.email !== email) {
      throw 'Invalid email';
    } else {
        next();
    }
  } catch {
    res.status(401).json({
      error: 'Invalid or missing Token'
    });
  }
};