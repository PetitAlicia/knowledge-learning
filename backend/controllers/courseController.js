const Cursus = require("../models/Cursus");
const Lesson = require("../models/Lesson");
const LessonCompletion = require("../models/LessonCompletion");
const Order = require("../models/Order");
const { checkAndGrantCertification } = require("./certificationController");

// Show all courses.
exports.getAllCursus = async (req, res) => {
    try {
        const cursus = await Cursus.find().populate("theme");
        res.json(cursus);
    } catch (error) {
        res.status(500).json({ message: "Il y a eu une erreur lors de la récupération des cursus." });
    }
};

// Show a specific course.
exports.getCursusById = async (req, res) => {
    try {
        const cursus = await Cursus.findById(req.params.id).populate("theme");
        if (!cursus) return res.status(404).json({ message: "Le cursus n'a pas été trouvé." });
        res.json(cursus);
    } catch (error) {
        res.status(500).json({ message: "Il y a eu une erreur lors de la récupération du cursus." });
    }
};

// Add a course. (Admin only)
exports.addCursus = async (req, res) => {
    try {
        const { title, price, theme } = req.body;
        const newCursus = await Cursus.create({ title, price, theme, createdBy: req.user._id, updatedBy: req.user._id });
        res.status(201).json(newCursus);
    } catch (error) {
        res.status(400).json({ message: "Il y a eu une erreur lors de l'ajout du cursus." });
    }
};

// Update a course. (Admin only)
exports.updateCursus = async (req, res) => {
    try {
        const { title, price, theme } = req.body;
        const cursus = await Cursus.findByIdAndUpdate(
            req.params.id,
            { title, price, theme, updatedBy: req.user._id },
            { new: true }
        );
        if (!cursus) return res.status(404).json({ message: "Le cursus n'a pas été trouvé." });
        res.json(cursus);
    } catch (error) {
        res.status(400).json({ message: "Il y a eu une erreur lors de la mise à jour du cursus." });
    }
};

// Delete a course. (Admin only)
exports.deleteCursus = async (req, res) => {
    try {
        await Cursus.findByIdAndDelete(req.params.id);
        res.json({ message: "Le cursus a été supprimé avec succès." });
    } catch (error) {
        res.status(400).json({ message: "Il y a eu une erreur lors de la suppression du cursus." });
    }
};

// Show all lessons.
exports.getAllLessons = async (req, res) => {
    try {
        const lessons = await Lesson.find().populate("cursus");
        res.json(lessons);
    } catch (error) {
        res.status(500).json({ message: "Il y a eu une erreur lors de la récupération des leçons." });
    }
};

// Show a specific lesson.
exports.getLessonById = async (req, res) => {
    try {
        const lesson = await Lesson.findById(req.params.id);
        res.json(lesson);
    } catch (error) {
        res.status(404).json({ message: "La leçon n'a pas été trouvée." });
    }
};

// Add a lesson. (Admin only)
exports.addLesson = async (req, res) => {
    try {
        const { title, description, price, theme, cursus, content } = req.body;
        const newLesson = await Lesson.create({ 
            title, description, price, theme, cursus, content, 
            createdBy: req.user._id, updatedBy: req.user._id 
        });
        res.status(201).json(newLesson);
    } catch (error) {
        res.status(400).json({ message: "Il y a eu une erreur lors de l'ajout de la leçon." });
    }
};

// Update a lesson. (Admin only)
exports.updateLesson = async (req, res) => {
    try {
        const { title, description, price, cursus } = req.body;
        const lesson = await Lesson.findByIdAndUpdate(
            req.params.id,
            { title, description, price, cursus, updatedBy: req.user._id },
            { new: true }
        );
        if (!lesson) return res.status(404).json({ message: "La leçon n'a pas été trouvée." });
        res.json(lesson);
    } catch (error) {
        res.status(400).json({ message: "Il y a eu une erreur lors de la mise à jour de la leçon." });
    }
};

// Delete a lesson. (Admin only)
exports.deleteLesson = async (req, res) => {
    try {
        await Lesson.findByIdAndDelete(req.params.id);
        res.json({ message: "La leçon a été supprimée avec succès." });
    } catch (error) {
        res.status(400).json({ message: "Il y a eu une erreur lors de la suppression de la leçon." });
    }
};

// Check if an user has validated all the lessons from a theme, and grant a certification if the user has done so.
exports.completeLesson = async (req, res) => {
    const { lessonId } = req.params;
    const userId = req.user._id;

    try {
        const lesson = await Lesson.findById(lessonId);
        if (!lesson) return res.status(404).json({ message: "La leçon n'a pas été trouvée." });

        const ordered = await Order.findOne({ user: userId, lesson: lessonId });
        if (!ordered) return res.status(403).json({ message: "Vous devez d'abord acheter cette leçon pour pouvoir la valider." });

        const alreadyCompleted = await LessonCompletion.findOne({ user: userId, lesson: lessonId });
        if (alreadyCompleted) return res.json({ message: "La leçon a déjà été validée." });

        await LessonCompletion.create({ user: userId, lesson: lessonId });

        const lessonsInTheme = await Lesson.find({ theme: lesson.theme });
        const validatedLessons = await LessonCompletion.find({ user: userId, lesson: { $in: lessonsInTheme.map(l => l._id) } });

        if (validatedLessons.length === lessonsInTheme.length) {
            const certification = await checkAndGrantCertification(userId, lesson.theme._id);
            return res.json({ message: certification.message, certificationGranted: true });
        }

        res.json({ message: "La leçon a été validée. Toutes les leçons du thème n'ont pas encore été validées.", certificationGranted: false });
    } catch (error) {
        res.status(500).json({ message: "Il y a eu une erreur lors de la validation de la leçon.", error: error.message });
    }
};

// Check if an user has validated a lesson.
exports.checkLessonCompletion = async (req, res) => {
    try {
        const lessonId = req.params.lessonId;
        const userId = req.user._id;
        const completion = await LessonCompletion.findOne({ user: userId, lesson: lessonId });

        if (!completion) return res.status(404).json({ message: "La leçon n'a pas été validée." });
        res.json({ message: "La leçon a été validée.", completion });
    } catch (error) {
        res.status(500).json({ message: "Il y a eu une erreur lors de la vérification de la validation de la leçon.", error: error.message });
    }
};

// Check if an user has bought a course.
exports.checkCoursePurchase = async (req, res) => {
    const { courseId, userId } = req.params;
    try {
        const order = await Order.findOne({ user: userId, cursus: courseId });
        res.json({ purchased: !!order });
    } catch (error) {
        res.status(500).json({ message: "Il y a eu une erreur lors de la vérification de l'achat du cursus.", error: error.message });
    }
};

// Check if an user has validated a course.
exports.checkCursusCompletion = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.user._id;
        const lessons = await Lesson.find({ cursus: courseId });
        const completedLessons = await LessonCompletion.find({ user: userId, lesson: { $in: lessons.map(l => l._id) } });

        res.json({ completed: completedLessons.length === lessons.length });
    } catch (error) {
        res.status(500).json({ message: "Il y a eu une erreur lors de la vérification de la validation du cursus.", error: error.message });
    }
};
