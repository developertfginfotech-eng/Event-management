const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add event name'],
      trim: true,
      maxlength: [100, 'Event name cannot be more than 100 characters'],
    },
    organizerName: {
      type: String,
      required: [true, 'Please add organizer name'],
      trim: true,
      maxlength: [100, 'Organizer name cannot be more than 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please add event description'],
      maxlength: [2000, 'Description cannot be more than 2000 characters'],
    },
    startDate: {
      type: Date,
      required: [true, 'Please add start date'],
    },
    endDate: {
      type: Date,
      required: [true, 'Please add end date'],
      validate: {
        validator: function (value) {
          return value >= this.startDate;
        },
        message: 'End date must be after start date',
      },
    },
    location: {
      city: {
        type: String,
        required: [true, 'Please add city'],
      },
      venue: {
        type: String,
        required: [true, 'Please add venue'],
      },
      address: String,
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
    },
    category: {
      type: String,
      required: [true, 'Please add event category'],
      enum: [
        'Trade Show',
        'Conference',
        'Exhibition',
        'Seminar',
        'Workshop',
        'Networking',
        'Product Launch',
        'Other',
      ],
    },
    websiteLink: {
      type: String,
      match: [
        /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
        'Please add a valid URL',
      ],
    },
    socialLinks: {
      linkedin: String,
      facebook: String,
      instagram: String,
    },
    status: {
      type: String,
      enum: ['Upcoming', 'Live', 'Completed', 'Postponed', 'Cancelled'],
      default: 'Upcoming',
    },
    statusOverride: {
      type: Boolean,
      default: false,
    },
    budget: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    banner: String,
    documents: [
      {
        name: String,
        url: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for total leads
eventSchema.virtual('totalLeads', {
  ref: 'Lead',
  localField: '_id',
  foreignField: 'event',
  count: true,
});

// Virtual for total expenses
eventSchema.virtual('totalExpenses', {
  ref: 'Expense',
  localField: '_id',
  foreignField: 'event',
  count: true,
});

// Method to calculate automatic status based on dates
eventSchema.methods.updateAutoStatus = function () {
  // Don't override if manually set to Postponed, Cancelled, or Completed
  if (this.statusOverride && ['Postponed', 'Cancelled', 'Completed'].includes(this.status)) {
    return this.status;
  }

  const now = new Date();
  const startDate = new Date(this.startDate);
  const endDate = new Date(this.endDate);

  // Set time to start of day for accurate comparison
  now.setHours(0, 0, 0, 0);
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);

  if (now < startDate) {
    this.status = 'Upcoming';
  } else if (now >= startDate && now <= endDate) {
    this.status = 'Live';
  } else {
    this.status = 'Completed';
  }

  return this.status;
};

// Pre-save middleware to auto-update status
eventSchema.pre('save', function (next) {
  this.updateAutoStatus();
  next();
});

// Pre-find middleware to update status for all found documents
eventSchema.post('find', async function (docs) {
  if (docs && docs.length > 0) {
    for (const doc of docs) {
      if (doc.updateAutoStatus) {
        doc.updateAutoStatus();
      }
    }
  }
});

// Pre-findOne middleware
eventSchema.post('findOne', async function (doc) {
  if (doc && doc.updateAutoStatus) {
    doc.updateAutoStatus();
  }
});

// Index for better query performance
eventSchema.index({ startDate: 1, status: 1 });
eventSchema.index({ createdBy: 1 });

module.exports = mongoose.model('Event', eventSchema);
