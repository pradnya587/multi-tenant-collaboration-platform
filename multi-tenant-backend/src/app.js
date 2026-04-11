import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import teamRoutes from "./routes/teamRoutes.js";



const app = express();

// ✅ Middleware
app.use(cors({
  origin: "http://192.168.56.1:3000", // frontend URL
  credentials: true,
}));

app.use(express.json());

// ✅ Routes
import chatRoutes from "./routes/chatRoutes.js";

app.use("/api/auth", authRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/chats", chatRoutes);


// ✅ Health check route
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// ✅ Global error handler (optional but good)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong" });
});

export default app;