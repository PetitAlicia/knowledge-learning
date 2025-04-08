const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authenticate = async (req, res, next) => {
    const token = req.headers["authorization"]?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Le token est manquant ou invalide." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(404).json({ message: "L'utilisateur n'a pas été trouvé." });
        }

        if (!user.isActive) {
            return res.status(403).json({ message: "Le compte n'a pas été activé." });
        }

        if (user.role !== "client" && user.role !== "admin") {
            return res.status(403).json({ message: "L'accès est réservé aux utilisateurs." });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Le token est invalide." });
    }
};

module.exports = authenticate;
