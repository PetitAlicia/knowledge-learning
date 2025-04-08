const Certification = require("../models/Certification");
const Lesson = require("../models/Lesson");
const LessonCompletion = require("../models/LessonCompletion");

// Show every certification an user has gotten.
exports.getUserCertifications = async (req, res) => {
    if (!req.user || !req.user._id) {
        return res.status(401).json({ message: "L'utilisateur n'est pas authentifié." });
    }

    try {
        const certifications = await Certification.find({ user: req.user._id })
            .populate("theme")
            .populate("user", "name email");

        if (!certifications.length) {
            return res.status(404).json({ message: "Aucune certification n'a été trouvée." });
        }

        res.json(certifications);
    } catch (error) {
        console.error("Il y a eu une erreur lors de la récupération des certifications :", error);
        res.status(500).json({ message: "Il y a eu une erreur serveur." });
    }
};

// Add a certification.
exports.addCertification = async (req, res) => {
    const { themeId } = req.body;

    if (!req.user || !req.user._id) {
        return res.status(401).json({ message: "L'utilisateur n'est pas authentifié.." });
    }

    if (!themeId) {
        return res.status(400).json({ message: "L'ID du thème est requis." });
    }

    const userId = req.user._id;

    try {
        const existingCertification = await Certification.findOne({ user: userId, theme: themeId });

        if (existingCertification) {
            return res.status(400).json({ message: "L'utilisateur possède déjà cette certification." });
        }

        const newCertification = new Certification({ user: userId, theme: themeId });
        await newCertification.save();

        res.status(201).json({ message: "La certification a été ajoutée avec succès.", certification: newCertification });
    } catch (error) {
        console.error("Il y a eu une erreur lors de la création de la certification :", error.message);
        res.status(500).json({ message: "Il y a eu une erreur serveur.", error: error.message });
    }
};

// Check if an user has validated all the lessons from a theme, and grant a certification if the user has done so.
exports.checkAndGrantCertification = async (userId, themeId) => {
    try {
        const lessons = await Lesson.find({ theme: themeId });
        if (!lessons.length) return { success: false, message: "Aucune leçon n'a été trouvée pour ce thème." };

        const validatedLessons = await LessonCompletion.find({
            user: userId,
            lesson: { $in: lessons.map(l => l._id) }
        });

        if (validatedLessons.length === lessons.length) {
            const existingCertification = await Certification.findOne({ user: userId, theme: themeId });

            if (!existingCertification) {
                const newCertification = new Certification({ user: userId, theme: themeId });
                await newCertification.save();
                return { success: true, message: "La certification a été accordée." };
            } else {
                return { success: false, message: "La certification existe déjà." };
            }
        }

        return { success: false, message: "Toutes les leçons n'ont pas encore été validées." };
    } catch (error) {
        console.error("Il y a eu une erreur lors de la vérification de certification :", error);
        return { success: false, message: "Il y a eu une erreur lors de la vérification." };
    }
};
