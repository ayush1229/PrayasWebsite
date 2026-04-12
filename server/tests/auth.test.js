const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const request = require("supertest");
const app = require("../src/app");
const seedSuperAdmin = require("../src/config/seeding");

const FAKE_ID = "000000000000000000000001";

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  await mongoose.syncIndexes();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Authentication & Admin Flow", () => {
  let superAdminCookie;
  let adminId;

  test("Run DB Seed -> creates a superadmin", async () => {
    // Calling the function we built earlier.
    await seedSuperAdmin();
    // Verify user exists directly
    const superAdmin = await mongoose.model("User").findOne({ role: "super_admin" });
    expect(superAdmin).toBeTruthy();
    expect(superAdmin.email).toBe(process.env.SUPERADMIN_EMAIL || "superadmin@example.com");
  });

  test("POST /auth/login as Super Admin -> 200 with JWT cookie", async () => {
    const res = await request(app).post("/auth/login").send({
      email: process.env.SUPERADMIN_EMAIL || "superadmin@example.com",
      password: "password123",
    });
    
    expect(res.status).toBe(200);
    expect(res.body.user.role).toBe("super_admin");
    expect(res.headers["set-cookie"]).toBeDefined();
    
    // Save cookie for subsequent requests
    superAdminCookie = res.headers["set-cookie"];
  });

  test("POST /auth/create-admin as Super Admin -> 201 creates a new admin user", async () => {
    const res = await request(app)
      .post("/auth/create-admin")
      .set("Cookie", superAdminCookie)
      .send({
        email: "test_new_admin@example.com",
        password: "adminpassword123",
      });

    expect(res.status).toBe(201);
    expect(res.body.admin.email).toBe("test_new_admin@example.com");
    expect(res.body.admin.role).toBe("admin");
    adminId = res.body.admin.id;
  });

  test("POST /auth/create-admin as NO AUTH -> 401 Unauthorized", async () => {
    const res = await request(app)
      .post("/auth/create-admin")
      .send({
        email: "hacker@example.com",
        password: "tryme",
      });
    expect(res.status).toBe(401);
  });

  test("POST /auth/login as new Admin -> 200", async () => {
    const res = await request(app).post("/auth/login").send({
      email: "test_new_admin@example.com",
      password: "adminpassword123",
    });
    
    expect(res.status).toBe(200);
    expect(res.body.user.role).toBe("admin");
  });

  test("DELETE /auth/admin/:id as Admin -> 403 Forbidden (Only Super Admins can delete)", async () => {
    // login as admin
    const adminRes = await request(app).post("/auth/login").send({
      email: "test_new_admin@example.com",
      password: "adminpassword123",
    });
    const adminCookie = adminRes.headers["set-cookie"];

    const res = await request(app)
      .delete(`/auth/admin/${adminId}`)
      .set("Cookie", adminCookie);
      
    expect(res.status).toBe(403);
  });

  test("DELETE /auth/admin/:id as Super Admin -> 200 deletes the admin", async () => {
    const res = await request(app)
      .delete(`/auth/admin/${adminId}`)
      .set("Cookie", superAdminCookie);
      
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/deleted successfully/i);
  });

  test("POST /auth/logout -> clears cookie", async () => {
    const res = await request(app)
      .post("/auth/logout")
      .set("Cookie", superAdminCookie);
    
    expect(res.status).toBe(200);
    // Express res.clearCookie often sets a past expiration date on the cookie
    const cookies = res.headers["set-cookie"][0];
    expect(cookies).toMatch(/token=;/);
  });
});

// ─────────────────────────────────────────────────────────────
// AUTH EDGE CASES
// ─────────────────────────────────────────────────────────────
describe("Auth edge cases", () => {
  let superAdminCookie;

  // Re-seed and log in for edge-case tests
  beforeAll(async () => {
    await seedSuperAdmin();
    const res = await request(app).post("/auth/login").send({
      email: process.env.SUPERADMIN_EMAIL || "superadmin@example.com",
      password: "password123",
    });
    superAdminCookie = res.headers["set-cookie"];
  });

  // ── Login edge cases ──────────────────────────────────────
  test("POST /auth/login → 401 with wrong password", async () => {
    const res = await request(app).post("/auth/login").send({
      email: process.env.SUPERADMIN_EMAIL || "superadmin@example.com",
      password: "wrongpassword",
    });
    expect(res.status).toBe(401);
    expect(res.body.error).toBeDefined();
  });

  test("POST /auth/login → 401 with non-existent email", async () => {
    const res = await request(app).post("/auth/login").send({
      email: "nobody@example.com",
      password: "somepassword",
    });
    expect(res.status).toBe(401);
    expect(res.body.error).toBeDefined();
  });

  test("POST /auth/login → 400 when body fields are missing", async () => {
    const res = await request(app).post("/auth/login").send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  // ── Create admin edge cases ───────────────────────────────
  test("POST /auth/create-admin → 400 when email already exists", async () => {
    // Create the admin once
    await request(app)
      .post("/auth/create-admin")
      .set("Cookie", superAdminCookie)
      .send({ email: "duplicate_admin@example.com", password: "pass123" });

    // Try to create again with same email
    const res = await request(app)
      .post("/auth/create-admin")
      .set("Cookie", superAdminCookie)
      .send({ email: "duplicate_admin@example.com", password: "pass123" });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/already exists/i);
  });

  test("POST /auth/create-admin → 400 when body fields are missing", async () => {
    const res = await request(app)
      .post("/auth/create-admin")
      .set("Cookie", superAdminCookie)
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  // ── Delete admin edge cases ───────────────────────────────
  test("DELETE /auth/admin/:id → 400 for non-existent admin ID", async () => {
    const res = await request(app)
      .delete(`/auth/admin/${FAKE_ID}`)
      .set("Cookie", superAdminCookie);
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/not found/i);
  });

  test("DELETE /auth/admin/:id → 400 when trying to delete super_admin", async () => {
    const superAdmin = await mongoose.model("User").findOne({ role: "super_admin" });
    const res = await request(app)
      .delete(`/auth/admin/${superAdmin._id}`)
      .set("Cookie", superAdminCookie);
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/cannot delete super admin/i);
  });

  test("DELETE /auth/admin/:id → 401 without authentication", async () => {
    const res = await request(app).delete(`/auth/admin/${FAKE_ID}`);
    expect(res.status).toBe(401);
  });
});

