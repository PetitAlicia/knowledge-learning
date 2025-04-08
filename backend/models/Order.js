const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    cursus: { type: mongoose.Schema.Types.ObjectId, ref: "Cursus", required: false },
    lesson: { type: mongoose.Schema.Types.ObjectId, ref: "Lesson", required: false },
    purchaseDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Order", OrderSchema);
