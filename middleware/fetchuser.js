const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET

const fetchusers = async (req, res, next) => {
  try {
    const token = req.header('auth-token');
    if (!token) {
      res.status(401).json({ success: false, msg: "Please enter valid token" })
    } else {
      const data = jwt.verify(token, secret);
      req.user = data;
      next();
    }
  } catch (error) {
    return res.status(400).json({ success: false, msg: error.message });
  }
}

module.exports = fetchusers;
