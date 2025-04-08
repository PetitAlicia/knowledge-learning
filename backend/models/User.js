const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    isActive: { type: Boolean, default: false },
    activationToken: { type: String, unique: true },
    role: { type: String, enum: ["client", "admin"], default: "client" },
});

module.exports = mongoose.model("User", UserSchema);
