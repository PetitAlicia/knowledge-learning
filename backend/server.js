require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB est connecté."))
    .catch(err => console.log(err));

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/courses", require("./routes/courseRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/themes", require("./routes/themeRoutes"));

const { router: certificationRouter } = require("./routes/certificationRoutes");
app.use("/api/certifications", certificationRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Le serveur a démarré sur le port ${PORT}.`));
