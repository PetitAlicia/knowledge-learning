const mongoose = require("mongoose");

const CertificationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    theme: { type: mongoose.Schema.Types.ObjectId, ref: "Theme", required: true },
    dateIssued: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Certification", CertificationSchema);
