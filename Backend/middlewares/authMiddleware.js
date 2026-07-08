const jwt = require("jsonwebtoken");
const User = require ("../models/userModel");

//Middleware to protect routes and verify JWT token
const protect = async (req, res, next) => {
    try{
        let token = req.headers.authorization;

        if (token && token.startsWith("Bearer ")) {
            token = token.split(" ")[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select("-password");

            if (!req.user) {
                return res.status(401).json({ message: "Not authorized, user not found" });
            }

            next();
        } else {
            res.status(401).json({message: "Not Authorized, No token provided"});
        }
        } catch (error) {
            res.status(401).json({message: "Token failed",error: error.message });
        }
    };

    //Middleware for Admin-only access
    const adminOnly = (req,res,next) => {
        if (req.user && req.user.role === "admin") {
            next();
        } else {
            res.status(403).json({message : "Access denied, Admins only"});
        }

    };

    module.exports = { protect, adminOnly };

