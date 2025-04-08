const Theme = require("../models/Theme");

// Show all themes.
exports.getAllThemes = async (req, res) => {
    try {
        const themes = await Theme.find();
        res.json(themes);
    } catch (error) {
        res.status(500).json({ message: "Il y a eu une erreur lors de la récupération des thèmes." });
    }
};

// Show a specific theme.
exports.getThemeById = async (req, res) => {
    try {
        const theme = await Theme.findById(req.params.id);
        if (!theme) {
            return res.status(404).json({ message: "Le thème n'a pas été trouvé." });
        }
        res.json(theme);
    } catch (error) {
        res.status(500).json({ message: "Il y a eu une erreur lors de la récupération du thème." });
    }
};

// Add a theme. (Admin only)
exports.addTheme = async (req, res) => {
    try {
        const { name } = req.body;
        const newTheme = await Theme.create({
            name,
            createdBy: req.user._id,
            updatedBy: req.user._id
        });
        res.status(201).json(newTheme);
    } catch (error) {
        res.status(400).json({ message: "Il y a eu une erreur lors de l'ajout du thème." });
    }
};

// Update a theme. (Admin only)
exports.updateTheme = async (req, res) => {
    try {
        const { name } = req.body;
        const theme = await Theme.findByIdAndUpdate(
            req.params.id,
            { name, updatedBy: req.user._id },
            { new: true }
        );

        if (!theme) {
            return res.status(404).json({ message: "Le thème n'a pas été trouvé." });
        }

        res.json(theme);
    } catch (error) {
        res.status(400).json({ message: "Il y a eu une erreur lors de la mise à jour du thème." });
    }
};

// Delete a theme. (Admin only)
exports.deleteTheme = async (req, res) => {
    try {
        await Theme.findByIdAndDelete(req.params.id);
        res.json({ message: "Le thème a été supprimé avec succès." });
    } catch (error) {
        res.status(400).json({ message: "Il y a eu une erreur lors de la suppression du thème." });
    }
};
