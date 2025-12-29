import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { dashboard } from "../controllers/dashboard.controller.js";

const r = Router();

r.get("/", requireAuth, dashboard);

export default r;
