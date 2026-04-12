import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  title: String,
  description: String,
  teamId: String,
  status: {
    type: String,
    default: "todo",
  },
  assigneeId: String,
  createdBy: String,
  deadline: Date,
}, { timestamps: true });

export default mongoose.model("Task", taskSchema);