const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    chatType: {
      type: String,
      enum: ['event', 'direct'],
      required: true,
      default: 'event',
      index: true
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: false, // Only required for event-based chats
      index: true
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false, // Only required for direct messages
      index: true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false // System messages have no sender
    },
    content: {
      type: String,
      required: [true, 'Message content is required'],
      maxlength: [5000, 'Message cannot be more than 5000 characters']
    },
    messageType: {
      type: String,
      enum: ['text', 'image', 'file', 'system'],
      default: 'text'
    },
    attachments: [
      {
        url: {
          type: String,
          required: true
        },
        fileName: String,
        fileType: String,
        fileSize: Number
      }
    ],
    pubnubTimetoken: {
      type: String,
      index: true,
      unique: true,
      sparse: true
    },
    isEdited: {
      type: Boolean,
      default: false
    },
    editedAt: Date,
    isDeleted: {
      type: Boolean,
      default: false
    },
    deletedAt: Date,
    readBy: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        readAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    metadata: {
      type: Map,
      of: String,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

// Compound indexes for better query performance
messageSchema.index({ event: 1, createdAt: -1 });
messageSchema.index({ event: 1, sender: 1 });
messageSchema.index({ event: 1, isDeleted: 1, createdAt: -1 });

// Indexes for direct messages
messageSchema.index({ chatType: 1, sender: 1, recipient: 1, createdAt: -1 });
messageSchema.index({ chatType: 1, recipient: 1, createdAt: -1 });

// Virtual for unread status
messageSchema.virtual('isRead').get(function () {
  return this.readBy && this.readBy.length > 0;
});

// Pre-save hook to set editedAt timestamp
messageSchema.pre('save', function (next) {
  if (this.isModified('content') && !this.isNew) {
    this.isEdited = true;
    this.editedAt = Date.now();
  }
  next();
});

module.exports = mongoose.model('Message', messageSchema);
