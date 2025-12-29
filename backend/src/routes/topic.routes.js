import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { listTopics, topicQuestions } from "../controllers/topic.controller.js";

const r = Router();

r.get("/", requireAuth, listTopics);
r.get("/:id/questions", requireAuth, topicQuestions);

export default r;
