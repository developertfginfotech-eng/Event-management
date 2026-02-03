const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: [true, 'Please add amount'],
      min: [0, 'Amount cannot be negative'],
    },
    category: {
      type: String,
      required: [true, 'Please add category'],
      enum: ['Travel', 'Food', 'Stay', 'Misc'],
    },
    subCategory: {
      type: String,
      enum: ['Cab', 'Train', 'Flight', 'Bus', 'Other'],
    },
    description: {
      type: String,
      required: [true, 'Please add description'],
      maxlength: [500, 'Description cannot be more than 500 characters'],
    },
    date: {
      type: Date,
      required: [true, 'Please add expense date'],
      default: Date.now,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receipt: {
      type: String,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedAt: Date,
    adminComments: String,
    paymentMethod: {
      type: String,
      enum: ['Cash', 'Card', 'UPI', 'Bank Transfer', 'Other'],
    },
    billNumber: String,
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
expenseSchema.index({ event: 1, status: 1 });
expenseSchema.index({ user: 1 });
expenseSchema.index({ date: -1 });

module.exports = mongoose.model('Expense', expenseSchema);
