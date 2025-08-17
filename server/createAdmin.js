const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');

async function createAdmin() {
  await mongoose.connect(process.env.MONGO_URI);

  const email = 'admin@example.com';
  const plainPassword = 'admin123';
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  const existing = await User.findOne({ email });
  if (existing) {
    console.log('Admin already exists.');
    return;
  }

  const user = new User({ email, password: hashedPassword });
  await user.save();
  console.log('Admin created successfully!');
  mongoose.disconnect();
}

createAdmin();

