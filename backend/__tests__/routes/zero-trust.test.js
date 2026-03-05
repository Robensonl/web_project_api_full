/**
 * 🧪 PRUEBAS DE ARQUITECTURA ZERO-TRUST
 *
 * Covers:
 * - RBAC: role-based access control (admin vs user)
 * - Token revocation: logout / blacklist
 * - Device Trust: X-Device-ID header handling
 */

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret-key";
process.env.MONGODB_TEST_URI = process.env.MONGODB_TEST_URI || "mongodb://localhost:27017/around_project_test";

const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../../app");
const User = require("../../models/user");
const userFixtures = require("../fixtures/users");
const { connectToDatabase, disconnectDatabase, clearDatabase } = require("../helpers/db");
const { clearBlacklist } = require("../../services/tokenBlacklist");

describe("Zero-Trust Architecture", () => {
  let adminUser;
  let regularUser;
  let adminToken;
  let userToken;

  beforeAll(async () => {
    await connectToDatabase();
  });

  afterAll(async () => {
    await disconnectDatabase();
  });

  beforeEach(async () => {
    await clearDatabase();
    clearBlacklist();

    adminUser = await User.create({
      ...userFixtures.validUser,
      email: "admin@example.com",
      role: "admin",
    });

    regularUser = await User.create({
      ...userFixtures.anotherUser,
      email: "user@example.com",
      role: "user",
    });

    adminToken = jwt.sign(
      { _id: adminUser._id, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    userToken = jwt.sign(
      { _id: regularUser._id, role: "user" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );
  });

  afterEach(async () => {
    await clearDatabase();
    clearBlacklist();
  });

  // ──────────────────────────────────────────────
  // RBAC
  // ──────────────────────────────────────────────
  describe("🔐 RBAC: Role-Based Access Control", () => {
    test("✅ Admin debería acceder a GET /users", async () => {
      const response = await request(app)
        .get("/users")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    test("❌ Usuario regular no debería acceder a GET /users", async () => {
      const response = await request(app)
        .get("/users")
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.status).toBe(403);
      expect(response.body.message).toContain("permiso");
    });

    test("✅ Usuario regular debería acceder a GET /users/me", async () => {
      const response = await request(app)
        .get("/users/me")
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body._id.toString()).toBe(regularUser._id.toString());
    });

    test("✅ Admin debería acceder a GET /users/me", async () => {
      const response = await request(app)
        .get("/users/me")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body._id.toString()).toBe(adminUser._id.toString());
    });
  });

  // ──────────────────────────────────────────────
  // Token Revocation (logout)
  // ──────────────────────────────────────────────
  describe("🚪 Token Revocation: Logout & Blacklist", () => {
    test("✅ Debería cerrar sesión y revocar el token", async () => {
      const response = await request(app)
        .post("/users/me/logout")
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toContain("cerrada");
    });

    test("❌ Token revocado no debería permitir acceso", async () => {
      // Logout first
      await request(app)
        .post("/users/me/logout")
        .set("Authorization", `Bearer ${userToken}`);

      // Try to use the revoked token
      const response = await request(app)
        .get("/users/me")
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.status).toBe(401);
      expect(response.body.message).toContain("revocado");
    });

    test("✅ Token no revocado debería seguir siendo válido", async () => {
      // Use userToken without logging out
      const response = await request(app)
        .get("/users/me")
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.status).toBe(200);
    });

    test("✅ Admin puede revocar su propio token", async () => {
      const logoutRes = await request(app)
        .post("/users/me/logout")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(logoutRes.status).toBe(200);

      const afterRes = await request(app)
        .get("/users/me")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(afterRes.status).toBe(401);
    });
  });

  // ──────────────────────────────────────────────
  // Device Trust
  // ──────────────────────────────────────────────
  describe("📱 Device Trust: X-Device-ID Header", () => {
    test("✅ Solicitud con X-Device-ID válido debería tener éxito", async () => {
      const response = await request(app)
        .get("/users/me")
        .set("Authorization", `Bearer ${userToken}`)
        .set("X-Device-ID", "device-abc-12345678");

      expect(response.status).toBe(200);
    });

    test("✅ Solicitud sin X-Device-ID debería funcionar (modo no estricto)", async () => {
      // Default: DEVICE_TRUST_STRICT is not set → non-blocking
      const response = await request(app)
        .get("/users/me")
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.status).toBe(200);
    });

    test("✅ Solicitud con X-Device-ID inválido debería funcionar (modo no estricto)", async () => {
      const response = await request(app)
        .get("/users/me")
        .set("Authorization", `Bearer ${userToken}`)
        .set("X-Device-ID", "!bad@id#");

      expect(response.status).toBe(200);
    });
  });

  // ──────────────────────────────────────────────
  // User model: role field
  // ──────────────────────────────────────────────
  describe("👤 User Model: role field", () => {
    test("✅ Nuevo usuario debería tener rol \"user\" por defecto", async () => {
      const user = await User.create({
        name: "Role Test",
        email: `roletest-${Date.now()}@example.com`,
        password: "Password123!",
        about: "Testing",
      });

      expect(user.role).toBe("user");
    });

    test("✅ Debería poder crear usuario con rol \"admin\"", async () => {
      const user = await User.create({
        name: "Admin Role Test",
        email: `adminrole-${Date.now()}@example.com`,
        password: "Password123!",
        about: "Testing",
        role: "admin",
      });

      expect(user.role).toBe("admin");
    });

    test("❌ Debería rechazar roles inválidos", async () => {
      await expect(User.create({
        name: "Invalid Role",
        email: `invalid-${Date.now()}@example.com`,
        password: "Password123!",
        about: "Testing",
        role: "superuser",
      })).rejects.toThrow();
    });
  });
});
