const authController = require("../controllers/authController");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const transporter = require("../utils/emailService");

jest.mock("../models/User");
jest.mock("bcryptjs");
jest.mock("jsonwebtoken");
jest.mock("../utils/emailService");

describe("Login", () => {
  it("should return token and user on valid credentials", async () => {
    const req = {
      body: { email: "emailtest@mail.com", password: "password12345" }
    };
    const res = {
      json: jest.fn(),
      status: jest.fn(() => res)
    };

    const userMock = {
      _id: "12345",
      email: "emailtest@mail.com",
      password: "hashedPass",
      isActive: true
    };

    User.findOne.mockResolvedValue(userMock);
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue("fakeToken");

    await authController.login(req, res);

    expect(res.json).toHaveBeenCalledWith({
      token: "fakeToken",
      user: { _id: "12345", email: "emailtest@mail.com" }
    });
  });

  it("should return 401 if credentials are invalid", async () => {
    const req = { body: { email: "nope", password: "wrong" } };
    const res = {
      status: jest.fn(() => res),
      json: jest.fn()
    };

    User.findOne.mockResolvedValue(null);

    await authController.login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "L'email ou le mot de passe est incorrect." });
    });
});

describe("Register", () => {
    it("should register a new user and send activation email", async () => {
      const req = {
        body: {
          name: "John",
          email: "emailtestJohn@mail.com",
          password: "secret"
        }
      };
      const res = {
        status: jest.fn(() => res),
        json: jest.fn()
      };
  
      User.create.mockResolvedValue({ name: "John", email: "emailtestJohn@mail.com" });
      jwt.sign.mockReturnValue("activationToken");
      transporter.sendMail.mockResolvedValue(true);
  
      await authController.register(req, res);
  
      expect(User.create).toHaveBeenCalled();
      expect(transporter.sendMail).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "L'utilisateur a été créé. Un email d'activation a été envoyé."
      });
    });
});

describe("Activate", () => {
    it("should activate user account", async () => {
      const req = {
        params: { token: "validToken" }
      };
      const res = {
        json: jest.fn(),
        status: jest.fn(() => res)
      };
  
      const userMock = { isActive: false, save: jest.fn() };
  
      jwt.verify = jest.fn().mockReturnValue({ email: "emailtest@testmail.com" });
      User.findOne = jest.fn().mockResolvedValue(userMock);
  
      await authController.activate(req, res);
  
      expect(userMock.isActive).toBe(true);
      expect(userMock.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        message: "Le compte a été activé avec succès. Vous pouvez maintenant vous connecter."
      });
    });
  
    it("should return 400 on invalid token", async () => {
      const req = { params: { token: "invalid" } };
      const res = {
        status: jest.fn(() => res),
        json: jest.fn()
      };
  
      jwt.verify = jest.fn(() => { throw new Error("Invalid token"); });
  
      await authController.activate(req, res);
  
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Le lien est invalide ou expiré." });
    });
});
