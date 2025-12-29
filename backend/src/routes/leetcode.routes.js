import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { getProfile, syncSolved } from "../controllers/leetcode.controller.js";

const r = Router();

r.get("/:username", requireAuth, getProfile);
r.post("/sync", requireAuth, syncSolved);

export default r;
