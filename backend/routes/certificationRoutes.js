const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authMiddleware");
const certificationController = require("../controllers/certificationController");

router.get("/", authenticate, certificationController.getUserCertifications);
router.post("/add-certification", authenticate, certificationController.addCertification);

module.exports = {
    router,
    checkAndGrantCertification: certificationController.checkAndGrantCertification
};
