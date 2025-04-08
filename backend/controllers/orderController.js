const Order = require("../models/Order");
const Lesson = require("../models/Lesson");

// Buy a course or a lesson.
exports.purchase = async (req, res) => {
    const { cursusId, lessonId } = req.body;
    const userId = req.user._id;

    try {
        if (cursusId) {
            const existingOrder = await Order.findOne({ user: userId, cursus: cursusId });
            if (existingOrder) {
                return res.status(400).json({ message: "Vous avez déjà acheté ce cursus." });
            }

            const newOrder = new Order({ user: userId, cursus: cursusId });
            await newOrder.save();

            const lessons = await Lesson.find({ cursus: cursusId });
            const existingLessonOrders = await Order.find({ user: userId, lesson: { $in: lessons.map(l => l._id) } });
            const purchasedLessonIds = new Set(existingLessonOrders.map(o => o.lesson.toString()));

            const newLessonOrders = lessons
                .filter(l => !purchasedLessonIds.has(l._id.toString()))
                .map(l => ({ user: userId, lesson: l._id }));

            if (newLessonOrders.length > 0) {
                await Order.insertMany(newLessonOrders);
            }

            return res.json({ message: "L'achat du cursus et de ses leçons a bien été réussi." });
        }

        if (lessonId) {
            const existingOrder = await Order.findOne({ user: userId, lesson: lessonId });
            if (existingOrder) {
                return res.status(400).json({ message: "Vous avez déjà acheté cette leçon." });
            }
            const newOrder = new Order({ user: userId, lesson: lessonId });
            await newOrder.save();
            return res.json({ message: "L'achat de la leçon a bien été réussi." });
        }

        res.status(400).json({ message: "Il n'y a aucun cursus ou leçon spécifié." });
    } catch (error) {
        console.error("Il y a eu une erreur lors de l'achat.", error);
        res.status(500).json({ message: "Il y a eu une erreur lors de l'achat." });
    }
};

// Check if an user has already bought a course.
exports.checkCoursePurchase = async (req, res) => {
    try {
        const userId = req.user._id;
        const courseId = req.params.courseId;

        if (!courseId) {
            return res.status(400).json({ message: "L'ID du cursus est requis." });
        }

        const order = await Order.findOne({ user: userId, cursus: courseId });

        res.json({ purchased: !!order });
    } catch (error) {
        console.error("Il y a eu une erreur lors de la vérification de l'achat du cursus :", error);
        res.status(500).json({ message: "Il y a eu une erreur lors de la vérification de l'achat du cursus." });
    }
};

// Check if an user has already bought a lesson.
exports.checkLessonPurchase = async (req, res) => {
    try {
        const userId = req.user._id;
        const lessonId = req.params.lessonId;

        if (!lessonId) {
            return res.status(400).json({ message: "L'ID de la leçon est requis." });
        }

        const order = await Order.findOne({ user: userId, lesson: lessonId });

        res.json({ purchased: !!order });
    } catch (error) {
        console.error("Il y a eu une erreur lors de la vérification de l'achat :", error);
        res.status(500).json({ message: "Il y a eu une erreur lors de la vérification de l'achat." });
    }
};

// Show all purchases an user has made.
exports.getAllPurchases = async (req, res) => {
    try {
        const order = await Order.find({ user: req.user._id })
            .populate("cursus")
            .populate("lesson");

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: "Il y a eu une erreur lors de la récupération des achats." });
    }
};
