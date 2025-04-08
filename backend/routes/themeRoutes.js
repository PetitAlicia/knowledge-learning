const express = require("express");
const authenticate = require("../middlewares/authMiddleware");
const isAdmin = require("../middlewares/isAdminMiddleware");
const themeController = require("../controllers/themeController");

const router = express.Router();

router.get("/", authenticate, themeController.getAllThemes);
router.get("/theme/:id", authenticate, themeController.getThemeById);
router.post("/add-theme", authenticate, isAdmin, themeController.addTheme);
router.put("/update-theme/:id", authenticate, isAdmin, themeController.updateTheme);
router.delete("/delete-theme/:id", authenticate, isAdmin, themeController.deleteTheme);

module.exports = router;
