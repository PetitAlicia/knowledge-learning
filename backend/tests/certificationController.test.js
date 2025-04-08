const request = require("supertest");
const app = require("../app");
const mongoose = require("mongoose");
const User = require("../models/User");
const Certification = require("../models/Certification");
const Lesson = require("../models/Lesson");
const LessonCompletion = require("../models/LessonCompletion");
const { connectDB, disconnectDB } = require("../utils/db");

describe("Certification Controller", () => {
    let userId;
    let themeId;

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

        const theme = new Theme({
            name: "Theme Test",
        });

        await theme.save();
        themeId = theme._id;
    });

    afterAll(async () => {
        await disconnectDB();
    });

    // "getUserCertifications" test.
    describe("GET /certifications", () => {
        it("should return certifications for an authenticated user", async () => {
            const certification = new Certification({
                user: userId,
                theme: themeId,
            });

            await certification.save();

            const res = await request(app)
                .get("/certifications")
                .set("Authorization", `Bearer ${userId}`)
                .expect(200);

            expect(res.body).toHaveLength(1);
            expect(res.body[0].user._id).toBe(userId.toString());
            expect(res.body[0].theme._id).toBe(themeId.toString());
        });

        it("should return 401 if the user is not authenticated", async () => {
            const res = await request(app).get("/certifications").expect(401);
            expect(res.body.message).toBe("L'utilisateur n'est pas authentifié.");
        });
    });

    // "addCertification" test.
    describe("POST /certifications", () => {
        it("should add a certification", async () => {
            const res = await request(app)
                .post("/certifications")
                .set("Authorization", `Bearer ${userId}`)
                .send({ themeId })
                .expect(201);

            expect(res.body.message).toBe("La certification a été ajoutée avec succès.");
            const certification = await Certification.findOne({
                user: userId,
                theme: themeId,
            });
            expect(certification).toBeTruthy();
        });

        it("should return 400 if themeId is missing", async () => {
            const res = await request(app)
                .post("/certifications")
                .set("Authorization", `Bearer ${userId}`)
                .send({})
                .expect(400);

            expect(res.body.message).toBe("L'ID du thème est requis.");
        });

        it("should return 400 if the certification already exists", async () => {
            await new Certification({
                user: userId,
                theme: themeId,
            }).save();

            const res = await request(app)
                .post("/certifications")
                .set("Authorization", `Bearer ${userId}`)
                .send({ themeId })
                .expect(400);

            expect(res.body.message).toBe("L'utilisateur possède déjà cette certification.");
        });
    });

    // "checkAndGrantCertification" test.
    describe("Check and Grant Certification", () => {
        it("should grant a certification if all lessons are completed", async () => {
            const lesson = new Lesson({
                theme: themeId,
                name: "Lesson n°1",
            });

            await lesson.save();

            const completion = new LessonCompletion({
                user: userId,
                lesson: lesson._id,
            });

            await completion.save();

            const result = await Certification.checkAndGrantCertification(userId, themeId);
            expect(result.success).toBe(true);
            expect(result.message).toBe("La certification a été accordée.");
        });

        it("should return a message if not all lessons are completed", async () => {
            const lesson = new Lesson({
                theme: themeId,
                name: "Lesson n°1",
            });

            await lesson.save();

            const result = await Certification.checkAndGrantCertification(userId, themeId);
            expect(result.success).toBe(false);
            expect(result.message).toBe("Toutes les leçons n'ont pas encore été validées.");
        });

        it("should return a message if certification already exists", async () => {
            const lesson = new Lesson({
                theme: themeId,
                name: "Lesson n°1",
            });

            await lesson.save();

            const completion = new LessonCompletion({
                user: userId,
                lesson: lesson._id,
            });

            await completion.save();

            await new Certification({
                user: userId,
                theme: themeId,
            }).save();

            const result = await Certification.checkAndGrantCertification(userId, themeId);
            expect(result.success).toBe(false);
            expect(result.message).toBe("La certification existe déjà.");
        });
    });
});
