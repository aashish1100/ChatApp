const mongoose = require("mongoose");

// Message Schema
const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: false, // Make it optional to allow file-only messages
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    file: {
      filename: { type: String },
      url: { type: String },
      type: { type: String }, // e.g., "image/png", "application/pdf"
    },
    read: {
      type: Boolean,
      default: false, // Indicates whether the message has been read
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

// Model for the message schema
module.exports = mongoose.model("Message", messageSchema);
