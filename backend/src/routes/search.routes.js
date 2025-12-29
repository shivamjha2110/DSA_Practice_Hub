import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { globalSearch } from "../controllers/search.controller.js";

const r = Router();

r.get("/", requireAuth, globalSearch);

export default r;
