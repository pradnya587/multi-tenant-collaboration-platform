import dotenv from "dotenv";
import app from "./app.js";
import { connectDB } from "./config/db.js";

// ✅ Load environment variables FIRST
dotenv.config();

const PORT = process.env.PORT || 5000;

// ✅ Start server only after DB connects
const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} 🚀`);
    });
  } catch (error) {
    console.error("❌ Server failed to start:", error.message);
    process.exit(1);
  }
};

startServer();