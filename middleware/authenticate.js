const jwt = require("jsonwebtoken");


module.exports = (req, res, next) => {
    const token = req.header("Authorization");

    if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    try {
        const decoded = jwt.verify(token.replace("Bearer ", ""),'123456');
        console.log("Decoded-----",decoded);
        req.user = decoded; // Attach user info to the request
        next();
    } catch (error) {
        res.status(400).json({ message: "Invalid token." });
    }
};
