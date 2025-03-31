const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const JWT_SCECRET = "sunnypraneeth";

function auth(req, res, next) {
    try {
        const token = req.cookies.token ;
        
        if (!token) {
            return res.json({ msg: "Token not generated" });
        }
        
        const response = jwt.verify(token, JWT_SCECRET); // If token is invalid, an error will be thrown here.
        
        if (!response || !response.id) { // If verification failed or id is not present
            return res.status(403).json({ Message: "Incorrect Credentials" });
        }

        req.userid = response.id; // Storing user ID for further processing.
        next(); // Call next middleware or route handler if verification is successful.
    } catch (error) {
        console.error("Token verification error:", error.message);
        return res.status(403).json({ Message: "Invalid or expired token" });
    }
}

module.exports = {
    auth,
    JWT_SCECRET
};
