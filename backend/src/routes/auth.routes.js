import { Router } from "express";
import { body } from "express-validator";
import { login, register } from "../controllers/auth.controller.js";

const r = Router();

r.post(
  "/register",
  body("username").isString().isLength({ min: 2, max: 32 }),
  body("email").isEmail(),
  body("password").isString().isLength({ min: 6, max: 128 }),
  register
);

r.post(
  "/login",
  body("email").isEmail(),
  body("password").isString().isLength({ min: 6, max: 128 }),
  login
);

export default r;
