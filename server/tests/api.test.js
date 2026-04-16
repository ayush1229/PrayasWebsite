const crypto = require("crypto");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const supertest = require("supertest");

let mockRazorpayOrderCounter = 0;

jest.mock("razorpay", () =>
  jest.fn().mockImplementation(() => ({
    orders: {
      create: jest.fn(async ({ amount, currency, receipt, notes }) => {
        mockRazorpayOrderCounter += 1;

        return {
          id: `order_test_${mockRazorpayOrderCounter}`,
          amount,
          currency,
          receipt,
          notes,
        };
      }),
    },
  })),
);

process.env.RAZORPAY_KEY_ID = "rzp_test_key";
process.env.RAZORPAY_KEY_SECRET = "rzp_test_secret";

const app = require("../src/app");
const seedSuperAdmin = require("../src/config/seeding");

const FAKE_ID = "000000000000000000000001";

let mongoServer;
let agent;

// Wrap request so existing `request(app)` calls return the authenticated agent
const request = () => agent;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  await mongoose.syncIndexes();

  await seedSuperAdmin();

  // Create superadmin agent
  const superAdminAgent = supertest.agent(app);
  await superAdminAgent.post("/auth/login").send({
    email: process.env.SUPERADMIN_EMAIL || "superadmin@example.com",
    password: "password123",
  });

  // Create test admin
  await superAdminAgent.post("/auth/create-admin").send({
    email: "api_test_admin@example.com",
    password: "adminpassword123"
  });

  // Login as test admin, save to global agent
  agent = supertest.agent(app);
  await agent.post("/auth/login").send({
    email: "api_test_admin@example.com",
    password: "adminpassword123"
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// ─────────────────────────────────────────────────────────────
// ACHIEVEMENTS  →  response shape: { success, data }
// ─────────────────────────────────────────────────────────────
describe("Achievements", () => {
  let createdId;
  let createdSlug;

  test("POST /api/achievements → 201 creates an achievement and auto-generates slug", async () => {
    const res = await request(app).post("/api/achievements").send({
      title: "First Academic Award",
      category: "Academic",
      year: 2024,
      description: "Top student award",
      priority: 5,
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe("First Academic Award");
    expect(res.body.data.slug).toBe("first-academic-award");
    createdId = res.body.data._id;
    createdSlug = res.body.data.slug;
  });

  test("POST /api/achievements → 500 when required fields are missing", async () => {
    const res = await request(app).post("/api/achievements").send({
      title: "Incomplete",
      // missing category and year
    });
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  test("GET /api/achievements → 200 returns an array", async () => {
    const res = await request(app).get("/api/achievements");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  test("GET /api/achievements/:slug → 200 returns the achievement", async () => {
    const res = await request(app).get(`/api/achievements/${createdSlug}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data._id).toBe(createdId);
    expect(res.body.data.title).toBe("First Academic Award");
  });

  test("GET /api/achievements/:slug → 404 for unknown slug", async () => {
    const res = await request(app).get("/api/achievements/does-not-exist-xyz");
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test("PUT /api/achievements/:id → 200 updates the achievement", async () => {
    const res = await request(app)
      .put(`/api/achievements/${createdId}`)
      .send({ description: "Updated description", priority: 10 });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.description).toBe("Updated description");
    expect(res.body.data.priority).toBe(10);
  });

  test("PUT /api/achievements/:id → 404 for unknown id", async () => {
    const res = await request(app)
      .put(`/api/achievements/${FAKE_ID}`)
      .send({ description: "nope" });
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test("DELETE /api/achievements/:id → 200 deletes the achievement", async () => {
    const res = await request(app).delete(`/api/achievements/${createdId}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/deleted/i);
  });

  test("DELETE /api/achievements/:id → 404 for already-deleted id", async () => {
    const res = await request(app).delete(`/api/achievements/${createdId}`);
    expect(res.status).toBe(404);
  });

  test("GET /api/achievements/:slug → 404 after deletion", async () => {
    const res = await request(app).get(`/api/achievements/${createdSlug}`);
    expect(res.status).toBe(404);
  });
});

// ─────────────────────────────────────────────────────────────
// ACTIVITIES  →  response shape: { success, data }
// ─────────────────────────────────────────────────────────────
describe("Activities", () => {
  let createdId;

  test("POST /api/activities → 201 creates an activity", async () => {
    const res = await request(app)
      .post("/api/activities")
      .send({
        activityName: "GyanManthan",
        year: 2024,
        tags: ["education", "quiz"],
        images: [{ imageUrl: "https://example.com/img.jpg", altText: "Event" }],
      });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.activityName).toBe("GyanManthan");
    expect(res.body.data.year).toBe(2024);
    expect(res.body.data.images).toHaveLength(1);
    createdId = res.body.data._id;
  });

  test("POST /api/activities → 500 on duplicate activityName + year", async () => {
    const res = await request(app).post("/api/activities").send({
      activityName: "GyanManthan",
      year: 2024,
    });
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  test("POST /api/activities → 500 when required fields are missing", async () => {
    const res = await request(app)
      .post("/api/activities")
      .send({
        tags: ["no-name"],
      });
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  test("GET /api/activities → 200 returns an array", async () => {
    const res = await request(app).get("/api/activities");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  test("GET /api/activities/:id → 200 returns the activity", async () => {
    const res = await request(app).get(`/api/activities/${createdId}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data._id).toBe(createdId);
  });

  test("GET /api/activities/:id → 404 for unknown id", async () => {
    const res = await request(app).get(`/api/activities/${FAKE_ID}`);
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test("PUT /api/activities/:id → 200 updates the activity", async () => {
    const res = await request(app)
      .put(`/api/activities/${createdId}`)
      .send({ tags: ["updated-tag"] });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.tags).toContain("updated-tag");
  });

  test("PUT /api/activities/:id → 404 for unknown id", async () => {
    const res = await request(app)
      .put(`/api/activities/${FAKE_ID}`)
      .send({ tags: ["nope"] });
    expect(res.status).toBe(404);
  });

  test("DELETE /api/activities/:id → 200 deletes the activity", async () => {
    const res = await request(app).delete(`/api/activities/${createdId}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/deleted/i);
  });

  test("DELETE /api/activities/:id → 404 for already-deleted id", async () => {
    const res = await request(app).delete(`/api/activities/${createdId}`);
    expect(res.status).toBe(404);
  });
});

// ─────────────────────────────────────────────────────────────
// CONTACTS  →  response shape: { success, data }
// ─────────────────────────────────────────────────────────────
describe("Contacts", () => {
  let createdId;

  test("POST /api/contacts → 201 creates a contact inquiry", async () => {
    const res = await request(app).post("/api/contacts").send({
      fullName: "John Doe",
      email: "john@example.com",
      phoneNumber: "9876543210",
      helpType: "Volunteer",
      message: "I want to volunteer with Prayas.",
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe("john@example.com");
    expect(res.body.data.status).toBe("Unread");
    expect(res.body.data.isArchived).toBe(false);
    createdId = res.body.data._id;
  });

  test("POST /api/contacts → 500 when required fields are missing", async () => {
    const res = await request(app).post("/api/contacts").send({
      email: "nofullname@example.com",
      // missing fullName and message
    });
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  test("GET /api/contacts → 200 returns an array of non-archived contacts", async () => {
    const res = await request(app).get("/api/contacts");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  test("GET /api/contacts/:id → 200 returns the contact", async () => {
    const res = await request(app).get(`/api/contacts/${createdId}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data._id).toBe(createdId);
    expect(res.body.data.fullName).toBe("John Doe");
  });

  test("GET /api/contacts/:id → 404 for unknown id", async () => {
    const res = await request(app).get(`/api/contacts/${FAKE_ID}`);
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test("PUT /api/contacts/:id → 200 updates status and replyMessage", async () => {
    const res = await request(app)
      .put(`/api/contacts/${createdId}`)
      .send({ status: "Replied", replyMessage: "Thanks for reaching out!" });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe("Replied");
    expect(res.body.data.replyMessage).toBe("Thanks for reaching out!");
  });

  test("PUT /api/contacts/:id → 200 archives a contact", async () => {
    const res = await request(app)
      .put(`/api/contacts/${createdId}`)
      .send({ isArchived: true });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.isArchived).toBe(true);
  });

  test("PUT /api/contacts/:id → 404 for unknown id", async () => {
    const res = await request(app)
      .put(`/api/contacts/${FAKE_ID}`)
      .send({ status: "Closed" });
    expect(res.status).toBe(404);
  });

  test("DELETE /api/contacts/:id → 200 deletes the contact", async () => {
    const res = await request(app).delete(`/api/contacts/${createdId}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("DELETE /api/contacts/:id → 404 for already-deleted id", async () => {
    const res = await request(app).delete(`/api/contacts/${createdId}`);
    expect(res.status).toBe(404);
  });
});

// ─────────────────────────────────────────────────────────────
// DONATIONS  →  response shape: direct document / array
// ─────────────────────────────────────────────────────────────
describe("Donations", () => {
  let createdId;
  let createdOrderId;

  test("POST /api/donations → 201 creates a donation", async () => {
    const res = await request(app).post("/api/donations").send({
      donorName: "Jane Smith",
      email: "jane@example.com",
      amount: 500,
      transactionId: "txn_test_001",
      currency: "INR",
      paymentStatus: "Success",
    });
    expect(res.status).toBe(201);
    expect(res.body.amount).toBe(500);
    expect(res.body.transactionId).toBe("txn_test_001");
    expect(res.body.currency).toBe("INR");
    expect(res.body.verified).toBe(false);
    createdId = res.body._id;
  });

  test("POST /api/donations → 500 on duplicate transactionId", async () => {
    const res = await request(app).post("/api/donations").send({
      amount: 100,
      transactionId: "txn_test_001",
    });
    expect(res.status).toBe(500);
  });

  test("POST /api/donations → 500 when required fields are missing", async () => {
    const res = await request(app).post("/api/donations").send({
      donorName: "Anonymous",
      // missing amount and transactionId
    });
    expect(res.status).toBe(500);
  });

  test("GET /api/donations → 200 returns an array", async () => {
    const res = await request(app).get("/api/donations");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test("GET /api/donations/:id → 200 returns the donation", async () => {
    const res = await request(app).get(`/api/donations/${createdId}`);
    expect(res.status).toBe(200);
    expect(res.body._id).toBe(createdId);
    expect(res.body.donorName).toBe("Jane Smith");
  });

  test("GET /api/donations/:id → 404 for unknown id", async () => {
    const res = await request(app).get(`/api/donations/${FAKE_ID}`);
    expect(res.status).toBe(404);
  });

  test("GET /api/donations/config → 200 returns public Razorpay config", async () => {
    const res = await request(app).get("/api/donations/config");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.key).toBe("rzp_test_key");
    expect(res.body.data.provider).toBe("razorpay");
  });

  test("POST /api/donations/create-order → 201 creates a pending Razorpay order", async () => {
    const res = await supertest(app).post("/api/donations/create-order").send({
      donorName: "Public Donor",
      email: "public@example.com",
      contact: "9876543210",
      amount: 250,
      message: "Keep it up",
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.orderId).toBe("order_test_1");
    expect(res.body.data.amount).toBe(25000);
    expect(res.body.data.key).toBe("rzp_test_key");
    createdOrderId = res.body.data.orderId;
  });

  test("POST /api/donations/verify → 200 marks a donation as verified", async () => {
    const paymentId = "pay_test_123";
    const signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${createdOrderId}|${paymentId}`)
      .digest("hex");

    const res = await supertest(app).post("/api/donations/verify").send({
      razorpay_order_id: createdOrderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: signature,
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.orderId).toBe(createdOrderId);
    expect(res.body.data.paymentId).toBe(paymentId);
    expect(res.body.data.verified).toBe(true);
    expect(res.body.data.paymentStatus).toBe("Success");
  });

  test("POST /api/donations/failure → 200 records a failed donation attempt", async () => {
    const createRes = await supertest(app).post("/api/donations/create-order").send({
      donorName: "Failed Donor",
      amount: 150,
    });

    const res = await supertest(app).post("/api/donations/failure").send({
      orderId: createRes.body.data.orderId,
      failureReason: "Payment declined",
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.paymentStatus).toBe("Failed");
    expect(res.body.data.failureReason).toBe("Payment declined");
  });

  test("PUT /api/donations/:id → 200 verifies a donation", async () => {
    const res = await request(app)
      .put(`/api/donations/${createdId}`)
      .send({ verified: true, receiptUrl: "https://example.com/receipt.pdf" });
    expect(res.status).toBe(200);
    expect(res.body.verified).toBe(true);
    expect(res.body.receiptUrl).toBe("https://example.com/receipt.pdf");
  });

  test("PUT /api/donations/:id → 200 updates paymentStatus", async () => {
    const res = await request(app)
      .put(`/api/donations/${createdId}`)
      .send({ paymentStatus: "Refunded" });
    expect(res.status).toBe(200);
    expect(res.body.paymentStatus).toBe("Refunded");
  });

  test("PUT /api/donations/:id → 404 for unknown id", async () => {
    const res = await request(app)
      .put(`/api/donations/${FAKE_ID}`)
      .send({ verified: true });
    expect(res.status).toBe(404);
  });

  test("DELETE /api/donations/:id → 200 deletes the donation", async () => {
    const res = await request(app).delete(`/api/donations/${createdId}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/deleted/i);
  });

  test("DELETE /api/donations/:id → 404 for already-deleted id", async () => {
    const res = await request(app).delete(`/api/donations/${createdId}`);
    expect(res.status).toBe(404);
  });
});

// ─────────────────────────────────────────────────────────────
// GLOBAL (SiteConfig)  →  response shape: direct document
// ─────────────────────────────────────────────────────────────
describe("Global (SiteConfig)", () => {
  test("GET /api/global → 200 returns default donation config when none exists yet", async () => {
    const res = await request(app).get("/api/global");
    expect(res.status).toBe(200);
    expect(res.body.type).toBe("site_config");
    expect(res.body.donation.provider).toBe("razorpay");
    expect(res.body.donation.publicKey).toBe("rzp_test_key");
  });

  test("PUT /api/global → 200 upserts the site config", async () => {
    const res = await request(app)
      .put("/api/global")
      .send({
        contactEmail: "prayas@example.com",
        donationMessage: "Support us!",
        socialLinks: {
          instagram: "https://instagram.com/prayas",
          linkedin: "https://linkedin.com/prayas",
        },
        donation: { upi: { upiId: "prayas@upi" } },
      });
    expect(res.status).toBe(200);
    expect(res.body.contactEmail).toBe("prayas@example.com");
    expect(res.body.donationMessage).toBe("Support us!");
    expect(res.body.socialLinks.instagram).toBe("https://instagram.com/prayas");
    expect(res.body.donation.upi.upiId).toBe("prayas@upi");
  });

  test("GET /api/global → 200 returns the config after upsert", async () => {
    const res = await request(app).get("/api/global");
    expect(res.status).toBe(200);
    expect(res.body.contactEmail).toBe("prayas@example.com");
    expect(res.body.type).toBe("site_config");
  });

  test("PUT /api/global → 200 partially updates the existing config", async () => {
    const res = await request(app).put("/api/global").send({
      contactEmail: "updated@example.com",
    });
    expect(res.status).toBe(200);
    expect(res.body.contactEmail).toBe("updated@example.com");
    // other fields should still be present
    expect(res.body.donationMessage).toBe("Support us!");
  });

  test("GET /api/global → 200 reflects partial update", async () => {
    const res = await request(app).get("/api/global");
    expect(res.status).toBe(200);
    expect(res.body.contactEmail).toBe("updated@example.com");
  });
});

// ─────────────────────────────────────────────────────────────
// NEWSLETTER  →  response shape: direct document / array
// ─────────────────────────────────────────────────────────────
describe("Newsletter", () => {
  const email = "subscriber@example.com";

  test("POST /api/newsletter/subscribe → 201 subscribes a new email", async () => {
    const res = await request(app)
      .post("/api/newsletter/subscribe")
      .send({ email });
    expect(res.status).toBe(201);
    expect(res.body.email).toBe(email);
    expect(res.body.isActive).toBe(true);
  });

  test("POST /api/newsletter/subscribe → 201 re-subscribing an existing email", async () => {
    const res = await request(app)
      .post("/api/newsletter/subscribe")
      .send({ email });
    expect(res.status).toBe(201);
    expect(res.body.isActive).toBe(true);
  });

  test("GET /api/newsletter → 200 returns active subscribers", async () => {
    const res = await request(app).get("/api/newsletter");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    const found = res.body.find((s) => s.email === email);
    expect(found).toBeDefined();
  });

  test("POST /api/newsletter/unsubscribe → 200 unsubscribes the email", async () => {
    const res = await request(app)
      .post("/api/newsletter/unsubscribe")
      .send({ email });
    expect(res.status).toBe(200);
    expect(res.body.email).toBe(email);
    expect(res.body.isActive).toBe(false);
    expect(res.body.unsubscribedAt).toBeDefined();
  });

  test("GET /api/newsletter → unsubscribed email no longer appears", async () => {
    const res = await request(app).get("/api/newsletter");
    expect(res.status).toBe(200);
    const found = res.body.find((s) => s.email === email);
    expect(found).toBeUndefined();
  });

  test("POST /api/newsletter/unsubscribe → 404 for unknown email", async () => {
    const res = await request(app)
      .post("/api/newsletter/unsubscribe")
      .send({ email: "nobody@example.com" });
    expect(res.status).toBe(404);
    expect(res.body.error).toBeDefined();
  });

  test("POST /api/newsletter/subscribe → 201 re-subscribing after unsubscribe reactivates", async () => {
    const res = await request(app)
      .post("/api/newsletter/subscribe")
      .send({ email });
    expect(res.status).toBe(201);
    expect(res.body.isActive).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────
// PAGES  →  response shape: direct document / array
// ─────────────────────────────────────────────────────────────
describe("Pages", () => {
  const slug = "about-us";

  test("POST /api/pages → 201 creates a page", async () => {
    const res = await request(app).post("/api/pages").send({
      slug,
      title: "About Us",
      content: "<p>We are Prayas.</p>",
      metaTitle: "About Prayas",
      metaDescription: "Learn more about the Prayas organisation.",
    });
    expect(res.status).toBe(201);
    expect(res.body.slug).toBe(slug);
    expect(res.body.title).toBe("About Us");
    expect(res.body.isPublished).toBe(true);
  });

  test("POST /api/pages → 500 on duplicate slug", async () => {
    const res = await request(app).post("/api/pages").send({
      slug,
      title: "Duplicate",
    });
    expect(res.status).toBe(500);
  });

  test("POST /api/pages → 500 when required fields are missing", async () => {
    const res = await request(app).post("/api/pages").send({
      content: "No slug or title",
    });
    expect(res.status).toBe(500);
  });

  test("GET /api/pages → 200 returns an array of published pages", async () => {
    const res = await request(app).get("/api/pages");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test("GET /api/pages/:slug → 200 returns the page", async () => {
    const res = await request(app).get(`/api/pages/${slug}`);
    expect(res.status).toBe(200);
    expect(res.body.slug).toBe(slug);
    expect(res.body.title).toBe("About Us");
  });

  test("GET /api/pages/:slug → 404 for unknown slug", async () => {
    const res = await request(app).get("/api/pages/nonexistent-page-xyz");
    expect(res.status).toBe(404);
    expect(res.body.error).toBeDefined();
  });

  test("PUT /api/pages/:slug → 200 updates the page content", async () => {
    const res = await request(app)
      .put(`/api/pages/${slug}`)
      .send({ content: "<p>Updated content.</p>", metaTitle: "Updated Meta" });
    expect(res.status).toBe(200);
    expect(res.body.content).toBe("<p>Updated content.</p>");
    expect(res.body.metaTitle).toBe("Updated Meta");
  });

  test("PUT /api/pages/:slug → 404 for unknown slug", async () => {
    const res = await request(app)
      .put("/api/pages/nonexistent-page-xyz")
      .send({ title: "Nope" });
    expect(res.status).toBe(404);
  });

  test("DELETE /api/pages/:slug → 200 deletes the page", async () => {
    const res = await request(app).delete(`/api/pages/${slug}`);
    expect(res.status).toBe(200);
    expect(res.body.slug).toBe(slug);
  });

  test("GET /api/pages/:slug → 404 after deletion", async () => {
    const res = await request(app).get(`/api/pages/${slug}`);
    expect(res.status).toBe(404);
  });

  test("DELETE /api/pages/:slug → 404 after already deleted", async () => {
    const res = await request(app).delete(`/api/pages/${slug}`);
    expect(res.status).toBe(404);
  });
});

// ─────────────────────────────────────────────────────────────
// PEOPLE  →  response shape: direct document / array
// ─────────────────────────────────────────────────────────────
describe("People", () => {
  let facultyId;
  let studentId;

  test("POST /api/people → 201 creates a Faculty member", async () => {
    const res = await request(app)
      .post("/api/people")
      .send({
        roleType: "Faculty",
        name: "Dr. Sharma",
        email: "sharma@prayas.org",
        designation: "Professor",
        bio: "Expert in education.",
        displayOrder: 1,
        socialLinks: { linkedin: "https://linkedin.com/in/sharma" },
      });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe("Dr. Sharma");
    expect(res.body.roleType).toBe("Faculty");
    expect(res.body.isActive).toBe(true);
    facultyId = res.body._id;
  });

  test("POST /api/people → 201 creates a Student member", async () => {
    const res = await request(app).post("/api/people").send({
      roleType: "Student",
      name: "Riya Patel",
      email: "riya@prayas.org",
      designation: "Team Lead",
      displayOrder: 1,
    });
    expect(res.status).toBe(201);
    expect(res.body.roleType).toBe("Student");
    studentId = res.body._id;
  });

  test("POST /api/people → 500 for invalid roleType", async () => {
    const res = await request(app).post("/api/people").send({
      roleType: "Admin",
      name: "Invalid Role",
    });
    expect(res.status).toBe(500);
  });

  test("POST /api/people → 500 when required fields are missing", async () => {
    const res = await request(app).post("/api/people").send({
      designation: "No name or roleType",
    });
    expect(res.status).toBe(500);
  });

  test("GET /api/people → 200 returns an array of active people", async () => {
    const res = await request(app).get("/api/people");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
  });

  test("GET /api/people → sorted Faculty before Student", async () => {
    const res = await request(app).get("/api/people");
    expect(res.status).toBe(200);
    const roles = res.body.map((p) => p.roleType);
    expect(roles[0]).toBe("Faculty");
    expect(roles[1]).toBe("Student");
  });

  test("GET /api/people/:id → 200 returns the Faculty member", async () => {
    const res = await request(app).get(`/api/people/${facultyId}`);
    expect(res.status).toBe(200);
    expect(res.body._id).toBe(facultyId);
    expect(res.body.name).toBe("Dr. Sharma");
  });

  test("GET /api/people/:id → 200 returns the Student member", async () => {
    const res = await request(app).get(`/api/people/${studentId}`);
    expect(res.status).toBe(200);
    expect(res.body._id).toBe(studentId);
    expect(res.body.name).toBe("Riya Patel");
  });

  test("GET /api/people/:id → 404 for unknown id", async () => {
    const res = await request(app).get(`/api/people/${FAKE_ID}`);
    expect(res.status).toBe(404);
    expect(res.body.error).toBeDefined();
  });

  test("PUT /api/people/:id → 200 updates the Faculty designation", async () => {
    const res = await request(app)
      .put(`/api/people/${facultyId}`)
      .send({ designation: "Associate Professor", bio: "Updated bio." });
    expect(res.status).toBe(200);
    expect(res.body.designation).toBe("Associate Professor");
    expect(res.body.bio).toBe("Updated bio.");
  });

  test("PUT /api/people/:id → 200 deactivates a person", async () => {
    const res = await request(app)
      .put(`/api/people/${studentId}`)
      .send({ isActive: false });
    expect(res.status).toBe(200);
    expect(res.body.isActive).toBe(false);
  });

  test("GET /api/people → deactivated member is excluded", async () => {
    const res = await request(app).get("/api/people");
    expect(res.status).toBe(200);
    const found = res.body.find((p) => p._id === studentId);
    expect(found).toBeUndefined();
  });

  test("PUT /api/people/:id → 404 for unknown id", async () => {
    const res = await request(app)
      .put(`/api/people/${FAKE_ID}`)
      .send({ name: "Ghost" });
    expect(res.status).toBe(404);
  });

  test("DELETE /api/people/:id → 200 deletes the Faculty member", async () => {
    const res = await request(app).delete(`/api/people/${facultyId}`);
    expect(res.status).toBe(200);
    expect(res.body._id).toBe(facultyId);
  });

  test("GET /api/people/:id → 404 after deletion", async () => {
    const res = await request(app).get(`/api/people/${facultyId}`);
    expect(res.status).toBe(404);
  });

  test("DELETE /api/people/:id → 404 for already-deleted id", async () => {
    const res = await request(app).delete(`/api/people/${facultyId}`);
    expect(res.status).toBe(404);
  });
});

// ─────────────────────────────────────────────────────────────
// UNAUTHENTICATED ACCESS → all protected routes must return 401
// Uses raw supertest (no auth cookie) to verify auth guards work
// ─────────────────────────────────────────────────────────────
describe("Unauthenticated access → 401 on all protected routes", () => {
  const raw = supertest(app);

  // Achievements
  test("POST /api/achievements → 401 without auth", async () => {
    const res = await raw.post("/api/achievements").send({ title: "X", category: "Academic", year: 2020 });
    expect(res.status).toBe(401);
  });
  test("PUT /api/achievements/:id → 401 without auth", async () => {
    const res = await raw.put(`/api/achievements/${FAKE_ID}`).send({ title: "X" });
    expect(res.status).toBe(401);
  });
  test("DELETE /api/achievements/:id → 401 without auth", async () => {
    const res = await raw.delete(`/api/achievements/${FAKE_ID}`);
    expect(res.status).toBe(401);
  });

  // Activities
  test("POST /api/activities → 401 without auth", async () => {
    const res = await raw.post("/api/activities").send({ activityName: "X", year: 2020 });
    expect(res.status).toBe(401);
  });
  test("PUT /api/activities/:id → 401 without auth", async () => {
    const res = await raw.put(`/api/activities/${FAKE_ID}`).send({ activityName: "X" });
    expect(res.status).toBe(401);
  });
  test("DELETE /api/activities/:id → 401 without auth", async () => {
    const res = await raw.delete(`/api/activities/${FAKE_ID}`);
    expect(res.status).toBe(401);
  });

  // Contacts
  test("POST /api/contacts → 401 without auth", async () => {
    const res = await raw.post("/api/contacts").send({ fullName: "X", email: "x@x.com", message: "hi" });
    expect(res.status).toBe(401);
  });
  test("PUT /api/contacts/:id → 401 without auth", async () => {
    const res = await raw.put(`/api/contacts/${FAKE_ID}`).send({ status: "Replied" });
    expect(res.status).toBe(401);
  });
  test("DELETE /api/contacts/:id → 401 without auth", async () => {
    const res = await raw.delete(`/api/contacts/${FAKE_ID}`);
    expect(res.status).toBe(401);
  });

  // Donations
  test("POST /api/donations → 401 without auth", async () => {
    const res = await raw.post("/api/donations").send({ amount: 100, transactionId: "txn_unauth_1" });
    expect(res.status).toBe(401);
  });
  test("PUT /api/donations/:id → 401 without auth", async () => {
    const res = await raw.put(`/api/donations/${FAKE_ID}`).send({ verified: true });
    expect(res.status).toBe(401);
  });
  test("DELETE /api/donations/:id → 401 without auth", async () => {
    const res = await raw.delete(`/api/donations/${FAKE_ID}`);
    expect(res.status).toBe(401);
  });

  // Global
  test("PUT /api/global → 401 without auth", async () => {
    const res = await raw.put("/api/global").send({ contactEmail: "x@x.com" });
    expect(res.status).toBe(401);
  });

  // Pages
  test("POST /api/pages → 401 without auth", async () => {
    const res = await raw.post("/api/pages").send({ slug: "unauth-page", title: "X" });
    expect(res.status).toBe(401);
  });
  test("PUT /api/pages/:slug → 401 without auth", async () => {
    const res = await raw.put("/api/pages/unauth-page").send({ title: "X" });
    expect(res.status).toBe(401);
  });
  test("DELETE /api/pages/:slug → 401 without auth", async () => {
    const res = await raw.delete("/api/pages/unauth-page");
    expect(res.status).toBe(401);
  });

  // People
  test("POST /api/people → 401 without auth", async () => {
    const res = await raw.post("/api/people").send({ roleType: "Faculty", name: "X" });
    expect(res.status).toBe(401);
  });
  test("PUT /api/people/:id → 401 without auth", async () => {
    const res = await raw.put(`/api/people/${FAKE_ID}`).send({ name: "X" });
    expect(res.status).toBe(401);
  });
  test("DELETE /api/people/:id → 401 without auth", async () => {
    const res = await raw.delete(`/api/people/${FAKE_ID}`);
    expect(res.status).toBe(401);
  });
});

// ─────────────────────────────────────────────────────────────
// NEWSLETTER EDGE CASES
// ─────────────────────────────────────────────────────────────
describe("Newsletter edge cases", () => {
  test("POST /api/newsletter/subscribe → 201 even when email is missing (upserts with undefined email)", async () => {
    // The service uses findOneAndUpdate with upsert:true and no email validation —
    // it succeeds with email=undefined. This test documents current behavior.
    const res = await supertest(app).post("/api/newsletter/subscribe").send({});
    expect(res.status).toBe(201);
  });

  test("POST /api/newsletter/unsubscribe → 200 when email is missing (matches the undefined-email doc created above)", async () => {
    // The previous subscribe test upserted a document with email=undefined.
    // Unsubscribing with no email finds that document → returns 200 with isActive: false.
    // This test documents the current behavior and the gap: no input validation on email.
    const res = await supertest(app).post("/api/newsletter/unsubscribe").send({});
    expect(res.status).toBe(200);
    expect(res.body.isActive).toBe(false);
  });
});
