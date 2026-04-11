import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  id: String,
  senderId: String,
  senderName: String,
  senderAvatar: String,
  content: String,
  timestamp: String,
  type: String
}, { _id: false });

const chatSchema = new mongoose.Schema({
  chatId: {
    type: String,
    required: true,
    unique: true
  },
  teamId: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["group", "private"],
    required: true,
  },
  participants: [{
    type: String,
  }],
  messages: [messageSchema]
}, { timestamps: true });

export default mongoose.model("Chat", chatSchema);
