const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
});

transporter.verify((error, success) => {
    if (error) {
        console.error("Il y a eu une erreur lors de la connexion à Gmail :", error);
    } else {
        console.log("La connexion à Gmail a réussie.");
    }
});

module.exports = transporter;
