const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');

async function createAdmin() {
  await mongoose.connect(process.env.MONGO_URI);

  const email = 'admin@example.com';
  const plainPassword = 'admin123'; // or 'vimalesh'
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  const existing = await User.findOne({ email });
  if (existing) {
    existing.password = hashedPassword;
    await existing.save();
    console.log('✅ Admin password updated!');
  } else {
    const user = new User({ email, password: hashedPassword });
    await user.save();
    console.log('✅ Admin created successfully!');
  }

  mongoose.disconnect();
}

createAdmin();
