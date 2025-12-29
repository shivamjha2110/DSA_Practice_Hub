import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { deleteMe, me, updatePreferences, updateProfile } from "../controllers/user.controller.js";

const r = Router();

r.get("/me", requireAuth, me);
r.put("/profile", requireAuth, updateProfile);
r.patch("/preferences", requireAuth, updatePreferences);
r.delete("/me", requireAuth, deleteMe);

export default r;
