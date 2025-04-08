const mongoose = require("mongoose");

const CursusSchema = new mongoose.Schema({
    title: String,
    price: Number,
    theme: { type: mongoose.Schema.Types.ObjectId, ref: "Theme" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

module.exports = mongoose.model("Cursus", CursusSchema);
