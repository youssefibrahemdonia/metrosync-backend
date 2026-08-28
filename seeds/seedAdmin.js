require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../src/models/Admin');

const seedAdmin = async () => {
  try {
    const email = process.env.TEST_ADMIN_EMAIL;
    const password = process.env.TEST_ADMIN_PASSWORD;

    if (!email || !password) {
      throw new Error(
        'TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD must be set in your .env file.'
      );
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB Atlas...');

    const existing = await Admin.findOne({ email });
    if (existing) {
      console.log(`Admin "${email}" already exists — skipping creation.`);
    } else {
      const admin = await Admin.create({ email, password });
      console.log(`Successfully seeded admin: ${admin.email}`);
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error(`Error seeding admin: ${error.message}`);
    process.exit(1);
  }
};

seedAdmin();