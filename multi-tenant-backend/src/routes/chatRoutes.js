import express from "express";
import { getChats, syncChats } from "../controllers/chatController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/:teamId", protect, getChats);
router.post("/sync", protect, syncChats);

export default router;
