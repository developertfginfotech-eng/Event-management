const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add lead name'],
      trim: true,
    },
    company: {
      type: String,
      required: [true, 'Please add company name'],
    },
    phone: {
      type: String,
      required: [true, 'Please add phone number'],
    },
    email: {
      type: String,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    designation: String,
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    source: {
      type: String,
      enum: ['Manual', 'Business Card Scan', 'CSV Upload', 'Other'],
      default: 'Manual',
    },
    priority: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      default: 'Medium',
    },
    status: {
      type: String,
      enum: ['New', 'Contacted', 'Follow-up', 'Qualified', 'Converted', 'Lost'],
      default: 'New',
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    notes: [
      {
        text: String,
        createdBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    followUps: [
      {
        date: Date,
        description: String,
        completed: {
          type: Boolean,
          default: false,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    attachments: [
      {
        name: String,
        url: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    businessCardImage: String,
    customFields: {
      type: Map,
      of: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
leadSchema.index({ event: 1, status: 1 });
leadSchema.index({ assignedTo: 1 });
leadSchema.index({ createdBy: 1 });

module.exports = mongoose.model('Lead', leadSchema);
