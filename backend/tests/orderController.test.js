const request = require("supertest");
const app = require("../app");
const mongoose = require("mongoose");
const User = require("../models/User");
const Order = require("../models/Order");
const Lesson = require("../models/Lesson");
const Cursus = require("../models/Cursus");
const { connectDB, disconnectDB } = require("../utils/db");

describe("Order Controller", () => {
    let userId;
    let cursusId;
    let lessonId;

    beforeAll(async () => {
        await connectDB();

        const user = new User({
            name: "User Test",
            email: "emailtest@mail.com",
            password: "passwordtest",
            isActive: true,
        });

        await user.save();
        userId = user._id;

        const cursus = new Cursus({
            name: "Cursus Test",
        });

        await cursus.save();
        cursusId = cursus._id;

        const lesson = new Lesson({
            name: "Lesson Test",
            cursus: cursusId,
        });

        await lesson.save();
        lessonId = lesson._id;
    });

    afterAll(async () => {
        await disconnectDB();
    });

    // "purchase" test.
    describe("POST /purchase", () => {
        it("should purchase a cursus and its lessons", async () => {
            const res = await request(app)
                .post("/purchase")
                .set("Authorization", `Bearer ${userId}`)
                .send({ cursusId })
                .expect(200);

            expect(res.body.message).toBe("L'achat du cursus et de ses leçons a été réussi.");

            const order = await Order.findOne({ user: userId, cursus: cursusId });
            expect(order).toBeTruthy();
        });

        it("should purchase a lesson", async () => {
            const res = await request(app)
                .post("/purchase")
                .set("Authorization", `Bearer ${userId}`)
                .send({ lessonId })
                .expect(200);

            expect(res.body.message).toBe("L'achat de la leçon a été réussi.");

            const order = await Order.findOne({ user: userId, lesson: lessonId });
            expect(order).toBeTruthy();
        });

        it("should return 400 if cursus or lesson is already purchased", async () => {
            await new Order({ user: userId, cursus: cursusId }).save();

            const res = await request(app)
                .post("/purchase")
                .set("Authorization", `Bearer ${userId}`)
                .send({ cursusId })
                .expect(400);

            expect(res.body.message).toBe("Vous avez déjà acheté ce cursus.");
        });

        it("should return 400 if neither cursusId nor lessonId is provided", async () => {
            const res = await request(app)
                .post("/purchase")
                .set("Authorization", `Bearer ${userId}`)
                .send({})
                .expect(400);

            expect(res.body.message).toBe("Aucun cursus ou leçon n'a été spécifié.");
        });
    });

    // "checkCoursePurchase" test.
    describe("GET /check-course-purchase/:courseId", () => {
        it("should return true if the user has purchased the course", async () => {
            await new Order({ user: userId, cursus: cursusId }).save();

            const res = await request(app)
                .get(`/check-course-purchase/${cursusId}`)
                .set("Authorization", `Bearer ${userId}`)
                .expect(200);

            expect(res.body.purchased).toBe(true);
        });

        it("should return false if the user has not purchased the course", async () => {
            const res = await request(app)
                .get(`/check-course-purchase/${cursusId}`)
                .set("Authorization", `Bearer ${userId}`)
                .expect(200);

            expect(res.body.purchased).toBe(false);
        });

        it("should return 400 if courseId is not provided", async () => {
            const res = await request(app)
                .get("/check-course-purchase/")
                .set("Authorization", `Bearer ${userId}`)
                .expect(400);

            expect(res.body.message).toBe("L'ID du cursus est requis.");
        });
    });

    // "checkLessonPurchase" test.
    describe("GET /check-lesson-purchase/:lessonId", () => {
        it("should return true if the user has purchased the lesson", async () => {
            await new Order({ user: userId, lesson: lessonId }).save();

            const res = await request(app)
                .get(`/check-lesson-purchase/${lessonId}`)
                .set("Authorization", `Bearer ${userId}`)
                .expect(200);

            expect(res.body.purchased).toBe(true);
        });

        it("should return false if the user has not purchased the lesson", async () => {
            const res = await request(app)
                .get(`/check-lesson-purchase/${lessonId}`)
                .set("Authorization", `Bearer ${userId}`)
                .expect(200);

            expect(res.body.purchased).toBe(false);
        });

        it("should return 400 if lessonId is not provided", async () => {
            const res = await request(app)
                .get("/check-lesson-purchase/")
                .set("Authorization", `Bearer ${userId}`)
                .expect(400);

            expect(res.body.message).toBe("L'ID de la leçon est requis.");
        });
    });

    // "getAllPurchases" test.
    describe("GET /purchases", () => {
        it("should return all purchases made by the user", async () => {
            const order1 = new Order({ user: userId, cursus: cursusId });
            await order1.save();

            const order2 = new Order({ user: userId, lesson: lessonId });
            await order2.save();

            const res = await request(app)
                .get("/purchases")
                .set("Authorization", `Bearer ${userId}`)
                .expect(200);

            expect(res.body).toHaveLength(2);
            expect(res.body[0].user._id).toBe(userId.toString());
        });
    });
});
