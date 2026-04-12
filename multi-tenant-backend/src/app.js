import express from "express";
import cors from "cors";

// ✅ Import routes
import authRoutes from "./routes/authRoutes.js";
import teamRoutes from "./routes/teamRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";

// ✅ Initialize app FIRST
const app = express();

// ✅ Middleware
app.use(cors()); // allow all origins (good for dev)
app.use(express.json());

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/tasks", taskRoutes); // ✅ NOW CORRECT PLACE
app.use("/api/chats", chatRoutes);

// ✅ Health check
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong" });
});

export default app;