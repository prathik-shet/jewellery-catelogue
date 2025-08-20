const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });  // load root .env
const path = require('path');

const User = require('../models/User');

async function createAdmin() {
  console.log("📌 Loaded MONGO_URI:", process.env.MONGO_URI); // debug

  if (!process.env.MONGO_URI) {
    console.error("❌ MONGO_URI not found in .env");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);

  const email = 'admin@example.com';
  const plainPassword = 'admin123';
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  const existing = await User.findOne({ email });
  if (existing) {
    console.log('⚠️ Admin already exists.');
    await mongoose.disconnect();
    return;
  }

  const user = new User({ email, password: hashedPassword });
  await user.save();
  console.log('✅ Admin created successfully!');
  await mongoose.disconnect();
}

createAdmin();
