const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    phone: {
      type: String,
      required: [true, 'Please add a phone number'],
      match: [/^[0-9]{10}$/, 'Please add a valid 10-digit phone number'],
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['Super Admin', 'Admin', 'Manager', 'Field User'],
      default: 'Field User',
    },
    designation: String,
    department: String,
    profilePhoto: String,
    isActive: {
      type: Boolean,
      default: true,
    },
    assignedEvents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
      },
    ],
    permissions: {
      canManageEvents: { type: Boolean, default: false },
      canManageUsers: { type: Boolean, default: false },
      canViewAllLeads: { type: Boolean, default: false },
      canApproveExpenses: { type: Boolean, default: false },
      canViewReports: { type: Boolean, default: false },
    },
    lastLogin: Date,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {
    timestamps: true,
  }
);

// Encrypt password using bcrypt
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next(); // Return here to prevent double execution
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Sign JWT and return
userSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Set permissions based on role
userSchema.pre('save', function (next) {
  if (this.role === 'Super Admin') {
    this.permissions = {
      canManageEvents: true,
      canManageUsers: true,
      canViewAllLeads: true,
      canApproveExpenses: true,
      canViewReports: true,
    };
  } else if (this.role === 'Admin') {
    this.permissions = {
      canManageEvents: true,
      canManageUsers: true,
      canViewAllLeads: true,
      canApproveExpenses: true,
      canViewReports: true,
    };
  } else if (this.role === 'Manager') {
    this.permissions = {
      canManageEvents: true,
      canManageUsers: false,
      canViewAllLeads: true,
      canApproveExpenses: false,
      canViewReports: true,
    };
  } else {
    // Field User permissions
    this.permissions = {
      canManageEvents: true,
      canManageUsers: false,
      canViewAllLeads: false,
      canApproveExpenses: false,
      canViewReports: false,
    };
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
