import express from "express";
import {
  getTeams,
  createTeam,
  joinTeam,
  getMembers,
  updateRole,
  removeMember,
} from "../controllers/teamController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// ✅ FIXED ROUTES
router.get("/", protect, getTeams);
router.post("/create", protect, createTeam);
router.post("/join", protect, joinTeam);
router.get("/:id/members", protect, getMembers);
router.patch("/members/role", protect, updateRole);
router.delete("/members", protect, removeMember);

export default router;