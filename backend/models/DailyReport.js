const mongoose = require('mongoose');

const dailyReportSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    attendance: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Attendance',
    },
    timeIn: {
      type: Date,
      required: true,
    },
    timeOut: {
      type: Date,
    },
    coverageSummary: {
      boothsCovered: {
        type: Number,
        required: [true, 'Please add number of booths covered'],
        min: [0, 'Booths covered cannot be negative'],
        default: 0,
      },
      interviewsConducted: {
        type: Number,
        required: [true, 'Please add number of interviews conducted'],
        min: [0, 'Interviews conducted cannot be negative'],
        default: 0,
      },
    },
    notes: {
      type: String,
      maxlength: [1000, 'Notes cannot be more than 1000 characters'],
    },
    challenges: {
      type: String,
      maxlength: [500, 'Challenges cannot be more than 500 characters'],
    },
    achievements: {
      type: String,
      maxlength: [500, 'Achievements cannot be more than 500 characters'],
    },
    status: {
      type: String,
      enum: ['Draft', 'Submitted', 'Approved', 'Rejected'],
      default: 'Draft',
    },
    submittedAt: Date,
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: Date,
    reviewComments: String,
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
dailyReportSchema.index({ user: 1, date: -1 });
dailyReportSchema.index({ event: 1, date: -1 });
dailyReportSchema.index({ status: 1 });

// Prevent duplicate reports - one report per user per day
dailyReportSchema.index({ user: 1, date: 1 }, { unique: true });

// Calculate work hours
dailyReportSchema.virtual('workHours').get(function () {
  if (this.timeIn && this.timeOut) {
    const diff = this.timeOut - this.timeIn;
    return Math.round((diff / (1000 * 60 * 60)) * 100) / 100; // Hours with 2 decimal places
  }
  return 0;
});

// Ensure virtuals are included in JSON
dailyReportSchema.set('toJSON', { virtuals: true });
dailyReportSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('DailyReport', dailyReportSchema);
