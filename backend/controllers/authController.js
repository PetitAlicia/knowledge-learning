const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const transporter = require("../utils/emailService");

// Login.
exports.login = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: "L'email ou le mot de passe est incorrect." });
    }

    if (!user.isActive) {
        return res.status(403).json({ message: "Le compte n'est pas activé." });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.json({ token, user: { _id: user._id, email: user.email } });
};

// Register.
exports.register = async (req, res) => {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const user = await User.create({ name, email, password: hashedPassword });

        const activationToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "1h" });
        const activationLink = `${process.env.BASE_URL}/activate/${activationToken}`;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Activation de votre compte Knowledge Learning.",
            text: `Bonjour ${name}, cliquez sur ce lien pour activer votre compte : ${activationLink}.`
        };

        await transporter.sendMail(mailOptions);

        res.status(201).json({ message: "L'utilisateur a bien été crée. Un email d'activation a été envoyé." });

    } catch (error) {
        console.error("Erreur complète :", error);
        res.status(400).json({ message: "Il y a eu une erreur lors de l'inscription.", error: error.message });    
    }
};

// Activate account.
exports.activate = async (req, res) => {
    try {
        const { token } = req.params;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findOne({ email: decoded.email });

        if (!user) {
            return res.status(404).json({ message: "L'utilisateur n'a pas été trouvé." });
        }

        if (user.isActive) {
            return res.status(400).json({ message: "Le compte a déjà été activé." });
        }

        user.isActive = true;
        await user.save();

        res.json({ message: "Votre compte a bien été activé. Vous pouvez maintenant vous connecter." });

    } catch (error) {
        res.status(400).json({ message: "Le lien est invalide ou a expiré." });
    }
};
