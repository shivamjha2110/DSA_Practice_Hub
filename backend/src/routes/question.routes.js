import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { revisitList, toggleRevisit, toggleSolved } from "../controllers/question.controller.js";

const r = Router();

r.get("/revisit", requireAuth, revisitList);
r.patch("/:id/toggle", requireAuth, toggleSolved);
r.patch("/:id/revisit", requireAuth, toggleRevisit);

export default r;
