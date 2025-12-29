import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { listLists, listQuestions, listSummary } from "../controllers/list.controller.js";

const router = Router();

router.get("/", requireAuth, listLists);
router.get("/:slug/summary", requireAuth, listSummary);
router.get("/:slug/questions", requireAuth, listQuestions);

export default router;
