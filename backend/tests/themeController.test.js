const request = require("supertest");
const app = require("../app");
const mongoose = require("mongoose");
const User = require("../models/User");
const Theme = require("../models/Theme");
const { connectDB, disconnectDB } = require("../utils/db");

describe("Theme Controller", () => {
    let adminUserId;
    let regularUserId;
    let themeId;

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

        const theme = new Theme({
            name: "Theme Test",
            createdBy: adminUserId,
            updatedBy: adminUserId,
        });
        await theme.save();
        themeId = theme._id;
    });

    afterAll(async () => {
        await disconnectDB();
    });

    // "getAllThemes" test.
    describe("GET /themes", () => {
        it("should return all themes", async () => {
            const res = await request(app)
                .get("/themes")
                .expect(200);

            expect(res.body).toHaveLength(1);
            expect(res.body[0].name).toBe("Theme Test");
        });

        it("should return 500 if there's a server error", async () => {
            jest.spyOn(Theme, "find").mockImplementationOnce(() => {
                throw new Error("Database error");
            });

            const res = await request(app).get("/themes").expect(500);
            expect(res.body.message).toBe("Il y a eu une erreur lors de la récupération des thèmes.");
        });
    });

    // "getThemeById" test.
    describe("GET /themes/:id", () => {
        it("should return a specific theme by ID", async () => {
            const res = await request(app)
                .get(`/themes/${themeId}`)
                .expect(200);

            expect(res.body.name).toBe("Theme Test");
        });

        it("should return 404 if theme not found", async () => {
            const fakeId = mongoose.Types.ObjectId();
            const res = await request(app)
                .get(`/themes/${fakeId}`)
                .expect(404);

            expect(res.body.message).toBe("Le thème n'a pas été trouvé.");
        });

        it("should return 500 if there's a server error", async () => {
            jest.spyOn(Theme, "findById").mockImplementationOnce(() => {
                throw new Error("Database error");
            });

            const res = await request(app)
                .get(`/themes/${themeId}`)
                .expect(500);

            expect(res.body.message).toBe("Il y a eu une erreur lors de la récupération du thème.");
        });
    });

    // "addTheme" test.
    describe("POST /themes", () => {
        it("should add a new theme (admin only)", async () => {
            const res = await request(app)
                .post("/themes")
                .set("Authorization", `Bearer ${adminUserId}`)
                .send({ name: "New Theme Test" })
                .expect(201);

            expect(res.body.name).toBe("New Theme Test");
        });

        it("should return 403 if user is not an admin", async () => {
            const res = await request(app)
                .post("/themes")
                .set("Authorization", `Bearer ${regularUserId}`)
                .send({ name: "Unauthorized Theme" })
                .expect(403);

            expect(res.body.message).toBe("L'accès est interdit.");
        });

        it("should return 400 if theme name is missing", async () => {
            const res = await request(app)
                .post("/themes")
                .set("Authorization", `Bearer ${adminUserId}`)
                .send({})
                .expect(400);

            expect(res.body.message).toBe("Il y a eu une erreur lors de l'ajout du thème.");
        });
    });

    // "updateTheme" test.
    describe("PUT /themes/:id", () => {
        it("should update a theme (admin only)", async () => {
            const res = await request(app)
                .put(`/themes/${themeId}`)
                .set("Authorization", `Bearer ${adminUserId}`)
                .send({ name: "Updated Theme Test" })
                .expect(200);

            expect(res.body.name).toBe("Updated Theme Test");
        });

        it("should return 403 if user is not an admin", async () => {
            const res = await request(app)
                .put(`/themes/${themeId}`)
                .set("Authorization", `Bearer ${regularUserId}`)
                .send({ name: "Unauthorized Update" })
                .expect(403);

            expect(res.body.message).toBe("Accès interdit.");
        });

        it("should return 404 if theme not found", async () => {
            const fakeId = mongoose.Types.ObjectId();
            const res = await request(app)
                .put(`/themes/${fakeId}`)
                .set("Authorization", `Bearer ${adminUserId}`)
                .send({ name: "Non-existing Theme" })
                .expect(404);

            expect(res.body.message).toBe("Le thème n'a pas été trouvé.");
        });
    });

    // "deleteTheme" test.
    describe("DELETE /themes/:id", () => {
        it("should delete a theme (admin only)", async () => {
            const res = await request(app)
                .delete(`/themes/${themeId}`)
                .set("Authorization", `Bearer ${adminUserId}`)
                .expect(200);

            expect(res.body.message).toBe("Le thème a été supprimé avec succès.");
        });

        it("should return 403 if user is not an admin", async () => {
            const res = await request(app)
                .delete(`/themes/${themeId}`)
                .set("Authorization", `Bearer ${regularUserId}`)
                .expect(403);

            expect(res.body.message).toBe("L'accès est interdit.");
        });

        it("should return 404 if theme not found", async () => {
            const fakeId = mongoose.Types.ObjectId();
            const res = await request(app)
                .delete(`/themes/${fakeId}`)
                .set("Authorization", `Bearer ${adminUserId}`)
                .expect(404);

            expect(res.body.message).toBe("Le thème n'a pas été trouvé.");
        });
    });
});
