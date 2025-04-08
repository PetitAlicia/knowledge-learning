const Order = require("../models/Order");

const hasAccess = async (req, res, next) => {
    const { lessonId } = req.params;
    const userId = req.user._id;

    try {
        const lessonOrder = await Order.findOne({ user: userId, lesson: lessonId });

        if (lessonOrder) return next();

        const lesson = await Lesson.findById(lessonId).populate("cursus");
        const cursusOrder = await Order.findOne({ user: userId, cursus: lesson.cursus._id });

        if (cursusOrder) return next();

        return res.status(403).json({ message: "L'accès a été refusé : vous n'avez pas acheté cette leçon ou son cursus." });

    } catch (error) {
        res.status(500).json({ message: "Il y a eu une erreur lors de la vérification d'accès à cette leçon." });
    }
};

module.exports = hasAccess;
