// const jwt=require("jsonwebtoken")
// const JWT_SCECRET="sunnypraneeth"


// function auth(req,res,next){
//     const token=req.cookies.token;
//     console.log(token);
    
//     if(!token){
//        return  res.json({
//             msg:"Token not generated"
//         })
//     }
//     const response=jwt.verify(token,JWT_SCECRET);
//     req.adminid=response.id
//     next();
//     if(!response){
//         res.status(403).json({
//             Message: "Incorrect Credentialsf"
//         })
//     }
// }
// module.exports={
//     auth,
//     JWT_SCECRET
// }
const jwt = require("jsonwebtoken");
const JWT_SCECRET = "sunnypraneeth";

function auth(req, res, next) {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ msg: "Token not generated" });
        }

        const response = jwt.verify(token, JWT_SCECRET);

        if (!response || !response.id) {
            return res.status(403).json({ msg: "Invalid token or credentials" });
        }

        req.adminid = response.id; // Setting user id to req object
        next();
    } catch (err) {
        console.error("Error verifying token:", err.message);
        return res.status(403).json({ msg: "Invalid or expired token" });
    }
}

module.exports = {
    auth,
    JWT_SCECRET
};
