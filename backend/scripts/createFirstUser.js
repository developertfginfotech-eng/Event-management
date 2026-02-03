const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

// Connect to database
mongoose.connect(process.env.MONGODB_URI);

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'Connection error:'));
db.once('open', async () => {
  console.log('Connected to MongoDB');

  try {
    const User = require('../models/User');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@gmail.com' });

    if (existingAdmin) {
      console.log('Admin user already exists!');
      process.exit(0);
    }

    // Create first admin user
    const admin = await User.create({
      name: 'Super Admin',
      email: 'admin@gmail.com',
      phone: '1234567890',
      password: 'admin123', // Will be hashed automatically by pre-save hook
      role: 'Super Admin',
      designation: 'Administrator',
      department: 'Management',
      isActive: true,
    });

    console.log('✅ First admin user created successfully!');
    console.log('Email: admin@gmail.com');
    console.log('Password: admin123');
    console.log('\n⚠️  Please change the password after first login!\n');

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
});
