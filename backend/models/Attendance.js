const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    checkIn: {
      time: {
        type: Date,
        required: true,
      },
      location: {
        latitude: Number,
        longitude: Number,
        address: String,
      },
      selfie: String,
    },
    checkOut: {
      time: Date,
      location: {
        latitude: Number,
        longitude: Number,
        address: String,
      },
    },
    workHours: {
      type: Number,
      default: 0,
    },
    notes: String,
    status: {
      type: String,
      enum: ['Present', 'Absent', 'Half Day', 'Leave'],
      default: 'Present',
    },
  },
  {
    timestamps: true,
  }
);

// Calculate work hours before saving
attendanceSchema.pre('save', function (next) {
  if (this.checkIn && this.checkOut && this.checkOut.time) {
    const diff = this.checkOut.time - this.checkIn.time;
    this.workHours = Math.round(diff / (1000 * 60 * 60) * 100) / 100; // Hours with 2 decimal places
  }
  next();
});

// Index for better query performance
attendanceSchema.index({ user: 1, date: -1 });
attendanceSchema.index({ event: 1, date: -1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
