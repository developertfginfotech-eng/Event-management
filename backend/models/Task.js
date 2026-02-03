const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add task title'],
      trim: true,
    },
    description: String,
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
    },
    dueDate: Date,
    priority: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      default: 'Medium',
    },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Completed', 'Cancelled'],
      default: 'Pending',
    },
    completedAt: Date,
    reminder: {
      enabled: {
        type: Boolean,
        default: false,
      },
      time: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
taskSchema.index({ assignedTo: 1, status: 1 });
taskSchema.index({ event: 1 });

module.exports = mongoose.model('Task', taskSchema);
