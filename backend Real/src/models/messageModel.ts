import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  username: {
    type: String,
    required: true
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const MessageModel = mongoose.model('Message', messageSchema); 