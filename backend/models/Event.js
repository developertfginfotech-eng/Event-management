const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add event name'],
      trim: true,
      maxlength: [100, 'Event name cannot be more than 100 characters'],
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
      enum: ['Upcoming', 'Live', 'Completed', 'Cancelled'],
      default: 'Upcoming',
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

// Index for better query performance
eventSchema.index({ startDate: 1, status: 1 });
eventSchema.index({ createdBy: 1 });

module.exports = mongoose.model('Event', eventSchema);
