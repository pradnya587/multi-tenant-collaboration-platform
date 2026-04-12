import express from "express";
import Task from "../models/Task.js";

const router = express.Router();

// ✅ NEW: GET tasks for logged-in user (ALL teams)
// ⚠️ MUST be above /:teamId
router.get("/user/:userId", async (req, res) => {
  try {
    const tasks = await Task.find({
      assigneeId: req.params.userId,
    });

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ GET tasks by team
router.get("/:teamId", async (req, res) => {
  try {
    const tasks = await Task.find({ teamId: req.params.teamId });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ CREATE task (ADMIN ONLY)
router.post("/", async (req, res) => {
  try {
    const { role } = req.body;

    if (role !== "admin") {
      return res
        .status(403)
        .json({ message: "Only admin can create tasks" });
    }

    const task = new Task(req.body);
    await task.save();

    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ UPDATE task (ADMIN OR ASSIGNEE)
router.patch("/:id", async (req, res) => {
  try {
    const { userId, role } = req.body;

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (role !== "admin" && task.assigneeId !== userId) {
      return res.status(403).json({
        message: "You can only update your own tasks",
      });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updatedTask);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ DELETE task (ADMIN ONLY)
router.delete("/:id", async (req, res) => {
  try {
    const { role } = req.body;

    if (role !== "admin") {
      return res
        .status(403)
        .json({ message: "Only admin can delete tasks" });
    }

    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;