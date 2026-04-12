const User = require("../authentication/auth.model");
const { hashPasswordService } = require("../authentication/auth.service");

const seedSuperAdmin = async () => {
  try {
    const superAdminExists = await User.findOne({ role: "super_admin" });

    if (!superAdminExists) {
      const hashedPassword = await hashPasswordService("password123");
      const defaultEmail = process.env.SUPERADMIN_EMAIL || "superadmin@example.com";

      const newSuperAdmin = new User({
        email: defaultEmail,
        password: hashedPassword,
        role: "super_admin",
        isActive: true
      });

      await newSuperAdmin.save();
      console.log(`[Seed] Default super_admin seeded with email: ${defaultEmail}`);
    } else {
      console.log("[Seed] super_admin already exists. Skipping root seed.");
    }
  } catch (error) {
    console.error("[Seed Error] Failed to seed superadmin:", error.message);
  }
};

module.exports = seedSuperAdmin;
