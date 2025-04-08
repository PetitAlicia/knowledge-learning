const mongoose = require("mongoose");

const LessonSchema = new mongoose.Schema({
    title: String,
    description: String,
    price: Number,
    theme: { type: mongoose.Schema.Types.ObjectId, ref: "Theme", required: true },
    cursus: { type: mongoose.Schema.Types.ObjectId, ref: "Cursus" },
    content: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

module.exports = mongoose.model("Lesson", LessonSchema);
