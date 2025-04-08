const express = require("express");
const authenticate = require("../middlewares/authMiddleware");
const isAdmin = require("../middlewares/isAdminMiddleware");
const hasAccess = require("../middlewares/hasAccessMiddleware");
const courseController = require("../controllers/courseController");

const router = express.Router();

router.get("/", authenticate, courseController.getAllCursus);
router.get("/cursus/:id", authenticate, courseController.getCursusById);
router.post("/add-cursus", authenticate, isAdmin, courseController.addCursus);
router.put("/update-cursus/:id", authenticate, isAdmin, courseController.updateCursus);
router.delete("/delete-cursus/:id", authenticate, isAdmin, courseController.deleteCursus);
router.get("/lessons", authenticate, courseController.getAllLessons);
router.get("/lesson/:id", authenticate, hasAccess, courseController.getLessonById);
router.post("/add-lesson", authenticate, isAdmin, courseController.addLesson);
router.put("/update-lesson/:id", authenticate, isAdmin, courseController.updateLesson);
router.delete("/delete-lesson/:id", authenticate, isAdmin, courseController.deleteLesson);
router.post("/complete-lesson/:lessonId", authenticate, courseController.completeLesson);
router.get("/check-completion/:lessonId", authenticate, courseController.checkLessonCompletion);
router.get("/check-course-purchase/:courseId/:userId", authenticate, courseController.checkCoursePurchase);
router.get("/check-cursus-completion/:courseId", authenticate, courseController.checkCursusCompletion);

module.exports = router;
