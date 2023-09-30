const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET_ADMIN
const fetchAdmin = async(req,res,next)=>{
    try {
        const token = req.header('auth-token');
        if(!token){
            res.status(401).json({success:false, msg:"Please enter valid token"})
        }
        const data = await jwt.verify(token, secret);
        req.admin = data.admin
    } catch (error) {
        return res.status(400).json({ success: false, msg: error.message });
    }
    next()
}
module.exports = fetchAdmin;