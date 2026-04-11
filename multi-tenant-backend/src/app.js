import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import teamRoutes from "./routes/teamRoutes.js";

 

const app = express();

// ✅ Middleware
app.use(cors({
  origin: "http://localhost:3000", // frontend URL
  credentials: true,
}));

app.use(express.json());

// ✅ Routes
app.use("/api/auth", authRoutes);

app.use("/api/teams", teamRoutes);


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