const User = require("../models/User");

const isAdmin = (req, res, next) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "L'accès est réservé aux administrateurs." });
    }
    next();
};

module.exports = isAdmin;
