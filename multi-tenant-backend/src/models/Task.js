import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  title: String,
  description: String,
  teamId: String,
  status: {
    type: String,
    default: "todo",
  },
  assigneeId: {
    type: mongoose.Schema.Types.ObjectId,  // ✅ Change from String
    ref: "User",                            // ✅ Add ref
  },
  createdBy: String,
  deadline: Date,
}, { timestamps: true });

export default mongoose.model("Task", taskSchema);