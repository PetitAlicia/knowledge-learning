const request = require("supertest");
const app = require("../app");
const mongoose = require("mongoose");
const User = require("../models/User");
const Cursus = require("../models/Cursus");
const Lesson = require("../models/Lesson");
const Order = require("../models/Order");
const LessonCompletion = require("../models/LessonCompletion");
const { connectDB, disconnectDB } = require("../utils/db");

describe("CursusController", () => {
    let adminUserId;
    let regularUserId;
    let cursusId;
    let lessonId;

    beforeAll(async () => {
        await connectDB();

        const adminUser = new User({
            name: "Admin Test",
            email: "adminemailtest@mail.com",
            password: "adminpasswordtest",
            isActive: true,
            role: "admin",
        });
        await adminUser.save();
        adminUserId = adminUser._id;

        const regularUser = new User({
            name: "User Test",
            email: "emailtest@mail.com",
            password: "passwordtest",
            isActive: true,
            role: "client",
        });
        await regularUser.save();
        regularUserId = regularUser._id;

        const cursus = new Cursus({
            title: "Cursus Test",
            price: 40,
            theme: mongoose.Types.ObjectId(),
            createdBy: adminUserId,
            updatedBy: adminUserId,
        });
        await cursus.save();
        cursusId = cursus._id;

        const lesson = new Lesson({
            title: "Lesson Test",
            description: "Description Test",
            price: 20,
            theme: mongoose.Types.ObjectId(),
            cursus: cursusId,
            content: "Lesson Content Test",
            createdBy: adminUserId,
            updatedBy: adminUserId,
        });
        await lesson.save();
        lessonId = lesson._id;
    });

    afterAll(async () => {
        await disconnectDB();
    });

    // "getAllCursus" test.
    describe("GET /cursus", () => {
        it("should return all cursus", async () => {
            const res = await request(app)
                .get("/cursus")
                .expect(200);

            expect(res.body).toHaveLength(1);
            expect(res.body[0].title).toBe("Cursus Test");
        });

        it("should return 500 if there's a server error", async () => {
            jest.spyOn(Cursus, "find").mockImplementationOnce(() => {
                throw new Error("Database error");
            });

            const res = await request(app)
                .get("/cursus")
                .expect(500);

            expect(res.body.message).toBe("Il y a eu une erreur lors de la récupération des cursus.");
        });
    });

    // "getCursusById" test.
    describe("GET /cursus/:id", () => {
        it("should return a specific cursus by ID", async () => {
            const res = await request(app)
                .get(`/cursus/${cursusId}`)
                .expect(200);

            expect(res.body.title).toBe("Cursus Test");
        });

        it("should return 404 if cursus not found", async () => {
            const fakeId = mongoose.Types.ObjectId();
            const res = await request(app)
                .get(`/cursus/${fakeId}`)
                .expect(404);

            expect(res.body.message).toBe("Le cursus n'a pas été trouvé.");
        });

        it("should return 500 if there's a server error", async () => {
            jest.spyOn(Cursus, "findById").mockImplementationOnce(() => {
                throw new Error("Database error");
            });

            const res = await request(app)
                .get(`/cursus/${cursusId}`)
                .expect(500);

            expect(res.body.message).toBe("Il y a eu une erreur lors de la récupération du cursus.");
        });
    });

    // "addCursus" test.
    describe("POST /cursus", () => {
        it("should add a new cursus (admin only)", async () => {
            const res = await request(app)
                .post("/cursus")
                .set("Authorization", `Bearer ${adminUserId}`)
                .send({ title: "New Cursus Test", price: 120, theme: mongoose.Types.ObjectId() })
                .expect(201);

            expect(res.body.title).toBe("New Cursus Test");
        });

        it("should return 403 if user is not an admin", async () => {
            const res = await request(app)
                .post("/cursus")
                .set("Authorization", `Bearer ${regularUserId}`)
                .send({ title: "Unauthorized Cursus", price: 150, theme: mongoose.Types.ObjectId() })
                .expect(403);

            expect(res.body.message).toBe("L'accès est interdit.");
        });

        it("should return 400 if cursus title is missing", async () => {
            const res = await request(app)
                .post("/cursus")
                .set("Authorization", `Bearer ${adminUserId}`)
                .send({})
                .expect(400);

            expect(res.body.message).toBe("Il y a eu une erreur lors de l'ajout du cursus.");
        });
    });

    // "updateCursus" test.
    describe("PUT /cursus/:id", () => {
        it("should update a cursus (admin only)", async () => {
            const res = await request(app)
                .put(`/cursus/${cursusId}`)
                .set("Authorization", `Bearer ${adminUserId}`)
                .send({ title: "Updated Cursus Test", price: 130, theme: mongoose.Types.ObjectId() })
                .expect(200);

            expect(res.body.title).toBe("Updated Cursus Test");
        });

        it("should return 403 if user is not an admin", async () => {
            const res = await request(app)
                .put(`/cursus/${cursusId}`)
                .set("Authorization", `Bearer ${regularUserId}`)
                .send({ title: "Unauthorized Update", price: 150, theme: mongoose.Types.ObjectId() })
                .expect(403);

            expect(res.body.message).toBe("L'accès est interdit.");
        });

        it("should return 404 if cursus not found", async () => {
            const fakeId = mongoose.Types.ObjectId();
            const res = await request(app)
                .put(`/cursus/${fakeId}`)
                .set("Authorization", `Bearer ${adminUserId}`)
                .send({ title: "Non-existing Cursus", price: 150, theme: mongoose.Types.ObjectId() })
                .expect(404);

            expect(res.body.message).toBe("Le cursus n'a pas été trouvé.");
        });
    });

    // "deleteCursus" test.
    describe("DELETE /cursus/:id", () => {
        it("should delete a cursus (admin only)", async () => {
            const res = await request(app)
                .delete(`/cursus/${cursusId}`)
                .set("Authorization", `Bearer ${adminUserId}`)
                .expect(200);

            expect(res.body.message).toBe("Le cursus a été supprimé avec succès.");
        });

        it("should return 403 if user is not an admin", async () => {
            const res = await request(app)
                .delete(`/cursus/${cursusId}`)
                .set("Authorization", `Bearer ${regularUserId}`)
                .expect(403);

            expect(res.body.message).toBe("Accès interdit.");
        });

        it("should return 404 if cursus not found", async () => {
            const fakeId = mongoose.Types.ObjectId();
            const res = await request(app)
                .delete(`/cursus/${fakeId}`)
                .set("Authorization", `Bearer ${adminUserId}`)
                .expect(404);

            expect(res.body.message).toBe("Le cursus n'a pas été trouvé.");
        });
    });

    // "getAllLessons" test.
    describe("GET /lessons", () => {
        it("should return all lessons", async () => {
            const res = await request(app)
                .get("/lessons")
                .expect(200);
    
            expect(res.body).toHaveLength(1);
            expect(res.body[0].title).toBe("Lesson Test");
        });
    
        it("should return 500 if there's a server error", async () => {
            jest.spyOn(Lesson, "find").mockImplementationOnce(() => {
                throw new Error("Database error");
            });
    
            const res = await request(app)
                .get("/lessons")
                .expect(500);
    
            expect(res.body.message).toBe("Il y a eu une erreur lors de la récupération des leçons.");
        });
    });
    
    // "getLessonById" test.
    describe("GET /lessons/:id", () => {
        it("should return a specific lesson by ID", async () => {
            const res = await request(app)
                .get(`/lessons/${lessonId}`)
                .expect(200);
    
            expect(res.body.title).toBe("Lesson Test");
        });
    
        it("should return 404 if lesson not found", async () => {
            const fakeId = mongoose.Types.ObjectId();
            const res = await request(app)
                .get(`/lessons/${fakeId}`)
                .expect(404);
    
            expect(res.body.message).toBe("La leçon n'a pas été trouvée.");
        });
    
        it("should return 500 if there's a server error", async () => {
            jest.spyOn(Lesson, "findById").mockImplementationOnce(() => {
                throw new Error("Database error");
            });
    
            const res = await request(app)
                .get(`/lessons/${lessonId}`)
                .expect(500);
    
            expect(res.body.message).toBe("Il y a eu une erreur lors de la récupération de la leçon.");
        });
    });
    
    // "addLesson" test.
    describe("POST /lessons", () => {
        it("should add a new lesson (admin only)", async () => {
            const res = await request(app)
                .post("/lessons")
                .set("Authorization", `Bearer ${adminUserId}`)
                .send({
                    title: "New Lesson Test",
                    description: "New Description Test",
                    price: 20,
                    theme: mongoose.Types.ObjectId(),
                    cursus: cursusId,
                    content: "New Lesson Content Test",
                })
                .expect(201);
    
            expect(res.body.title).toBe("New Lesson Test");
        });
    
        it("should return 403 if user is not an admin", async () => {
            const res = await request(app)
                .post("/lessons")
                .set("Authorization", `Bearer ${regularUserId}`)
                .send({
                    title: "Unauthorized lesson",
                    description: "Unauthorized lesson",
                    price: 20,
                    theme: mongoose.Types.ObjectId(),
                    cursus: cursusId,
                    content: "Unauthorized lesson",
                })
                .expect(403);
    
            expect(res.body.message).toBe("L'accès est interdit.");
        });
    
        it("should return 400 if lesson title is missing", async () => {
            const res = await request(app)
                .post("/lessons")
                .set("Authorization", `Bearer ${adminUserId}`)
                .send({})
                .expect(400);
    
            expect(res.body.message).toBe("Il y a eu une erreur lors de l'ajout de la leçon.");
        });
    });

    // "updateLesson" test.
    describe("PUT /lessons/:id", () => {
        it("should update a lesson (admin only)", async () => {
            const res = await request(app)
                .put(`/lessons/${lessonId}`)
                .set("Authorization", `Bearer ${adminUserId}`)
                .send({
                    title: "Updated Lesson Test",
                    description: "Updated Description Test",
                    price: 20,
                    theme: mongoose.Types.ObjectId(),
                    cursus: cursusId,
                    content: "Updated Lesson Content Test",
                })
                .expect(200);
    
            expect(res.body.title).toBe("Updated Lesson Test");
        });
    
        it("should return 403 if user is not an admin", async () => {
            const res = await request(app)
                .put(`/lessons/${lessonId}`)
                .set("Authorization", `Bearer ${regularUserId}`)
                .send({
                    title: "Unauthorized update",
                    description: "Unauthorized update",
                    price: 20,
                    theme: mongoose.Types.ObjectId(),
                    cursus: cursusId,
                    content: "Unauthorized update",
                })
                .expect(403);
    
            expect(res.body.message).toBe("Accès interdit.");
        });
    
        it("should return 404 if lesson not found", async () => {
            const fakeId = mongoose.Types.ObjectId();
            const res = await request(app)
                .put(`/lessons/${fakeId}`)
                .set("Authorization", `Bearer ${adminUserId}`)
                .send({
                    title: "Non-existing lesson",
                    description: "Non-existing description",
                    price: 40,
                    theme: mongoose.Types.ObjectId(),
                    cursus: cursusId,
                    content: "Non-existing content",
                })
                .expect(404);
    
            expect(res.body.message).toBe("La leçon n'a pas été trouvée.");
        });
    });
    
    // "deleteLesson" test.
    describe("DELETE /lessons/:id", () => {
        it("should delete a lesson (admin only)", async () => {
            const res = await request(app)
                .delete(`/lessons/${lessonId}`)
                .set("Authorization", `Bearer ${adminUserId}`)
                .expect(200);
    
            expect(res.body.message).toBe("La leçon a été supprimée avec succès.");
        });
    
        it("should return 403 if user is not an admin", async () => {
            const res = await request(app)
                .delete(`/lessons/${lessonId}`)
                .set("Authorization", `Bearer ${regularUserId}`)
                .expect(403);
    
            expect(res.body.message).toBe("L'accès est interdit.");
        });
    
        it("should return 404 if lesson not found", async () => {
            const fakeId = mongoose.Types.ObjectId();
            const res = await request(app)
                .delete(`/lessons/${fakeId}`)
                .set("Authorization", `Bearer ${adminUserId}`)
                .expect(404);
    
            expect(res.body.message).toBe("La leçon n'a pas été trouvée.");
        });
    });
    
    // "completeLesson" test.
    describe("POST /lessons/:lessonId/complete", () => {
        it("should complete the lesson and grant certification if all lessons in the theme are completed", async () => {
            const res = await request(app)
                .post(`/lessons/${lessonId}/complete`)
                .set("Authorization", `Bearer ${regularUserId}`)
                .expect(200);
    
            expect(res.body.message).toBe("La leçon a été validée. Toutes les leçons du thème n'ont pas encore été validées.");
            expect(res.body.certificationGranted).toBe(false);
        });
    
        it("should return 403 if user hasn't purchased the lesson", async () => {
            const fakeLessonId = mongoose.Types.ObjectId();
            const res = await request(app)
                .post(`/lessons/${fakeLessonId}/complete`)
                .set("Authorization", `Bearer ${regularUserId}`)
                .expect(403);
    
            expect(res.body.message).toBe("Vous devez acheter cette leçon pour la valider.");
        });
    
        it("should return 400 if the lesson is already completed", async () => {
            await LessonCompletion.create({ user: regularUserId, lesson: lessonId });
    
            const res = await request(app)
                .post(`/lessons/${lessonId}/complete`)
                .set("Authorization", `Bearer ${regularUserId}`)
                .expect(200);
    
            expect(res.body.message).toBe("La leçon a déjà été validée.");
        });
    
        it("should return 404 if lesson not found", async () => {
            const fakeLessonId = mongoose.Types.ObjectId();
            const res = await request(app)
                .post(`/lessons/${fakeLessonId}/complete`)
                .set("Authorization", `Bearer ${regularUserId}`)
                .expect(404);
    
            expect(res.body.message).toBe("La leçon n'a pas été trouvée.");
        });
    });
    
    // "checkLessonCompletion" test.
    describe("GET /lessons/:lessonId/completion", () => {
        it("should return 200 if the lesson is completed by the user", async () => {
            await LessonCompletion.create({ user: regularUserId, lesson: lessonId });
    
            const res = await request(app)
                .get(`/lessons/${lessonId}/completion`)
                .set("Authorization", `Bearer ${regularUserId}`)
                .expect(200);
    
            expect(res.body.message).toBe("La leçon a été validée.");
        });
    
        it("should return 404 if the lesson is not completed by the user", async () => {
            const res = await request(app)
                .get(`/lessons/${lessonId}/completion`)
                .set("Authorization", `Bearer ${regularUserId}`)
                .expect(404);
    
            expect(res.body.message).toBe("La leçon n'a pas été validée.");
        });
    
        it("should return 500 if an error occurs", async () => {
            jest.spyOn(LessonCompletion, "findOne").mockImplementationOnce(() => {
                throw new Error("Database error");
            });
    
            const res = await request(app)
                .get(`/lessons/${lessonId}/completion`)
                .set("Authorization", `Bearer ${regularUserId}`)
                .expect(500);
    
            expect(res.body.message).toBe("Il y a eu une erreur lors de la vérification de la validation de la leçon.");
        });
    });
    
    // "checkCoursePurchase" test.
    describe("GET /courses/:courseId/purchase", () => {
        it("should return true if the user has purchased the course", async () => {
            await Order.create({ user: regularUserId, cursus: cursusId });
    
            const res = await request(app)
                .get(`/courses/${cursusId}/purchase`)
                .set("Authorization", `Bearer ${regularUserId}`)
                .expect(200);
    
            expect(res.body.purchased).toBe(true);
        });
    
        it("should return false if the user has not purchased the course", async () => {
            const res = await request(app)
                .get(`/courses/${cursusId}/purchase`)
                .set("Authorization", `Bearer ${regularUserId}`)
                .expect(200);
    
            expect(res.body.purchased).toBe(false);
        });
    
        it("should return 500 if an error occurs", async () => {
            jest.spyOn(Order, "findOne").mockImplementationOnce(() => {
                throw new Error("Database error");
            });
    
            const res = await request(app)
                .get(`/courses/${cursusId}/purchase`)
                .set("Authorization", `Bearer ${regularUserId}`)
                .expect(500);
    
            expect(res.body.message).toBe("Il y a eu une erreur lors de la vérification de l'achat du cursus.");
        });
    });

    // "checkCursusCompletion" test.
    describe("GET /courses/:courseId/completion", () => {
        it("should return true if the user has completed all lessons in the course", async () => {
            await LessonCompletion.create({ user: regularUserId, lesson: lessonId });
    
            const res = await request(app)
                .get(`/courses/${cursusId}/completion`)
                .set("Authorization", `Bearer ${regularUserId}`)
                .expect(200);
    
            expect(res.body.completed).toBe(true);
        });
    
        it("should return false if the user has not completed all lessons in the course", async () => {
            const res = await request(app)
                .get(`/courses/${cursusId}/completion`)
                .set("Authorization", `Bearer ${regularUserId}`)
                .expect(200);
    
            expect(res.body.completed).toBe(false);
        });
    
        it("should return 500 if an error occurs", async () => {
            jest.spyOn(LessonCompletion, "find").mockImplementationOnce(() => {
                throw new Error("Database error");
            });
    
            const res = await request(app)
                .get(`/courses/${cursusId}/completion`)
                .set("Authorization", `Bearer ${regularUserId}`)
                .expect(500);
    
            expect(res.body.message).toBe("Il y a eu une erreur lors de la vérification de la complétion du cursus.");
        });
    });
});
