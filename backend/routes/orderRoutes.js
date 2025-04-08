const express = require("express");
const authenticate = require("../middlewares/authMiddleware");
const orderController = require("../controllers/orderController");

const router = express.Router();

router.post("/purchase", authenticate, orderController.purchase);
router.get("/check-course-purchase/:courseId", authenticate, orderController.checkCoursePurchase);
router.get("/check-purchase/:lessonId", authenticate, orderController.checkLessonPurchase);
router.get("/all-purchases", authenticate, orderController.getAllPurchases);

module.exports = router;
