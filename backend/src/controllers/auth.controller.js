import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import User from "../models/User.js";

function signToken(userId) {
  if (!process.env.JWT_SECRET) throw new Error("Missing JWT_SECRET");
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

function publicUser(u) {
  return {
    id: String(u._id),
    username: u.username,
    email: u.email,
    leetcodeUsername: u.leetcodeUsername,
    leetcodeLastSyncAt: u.leetcodeLastSyncAt,
    autoSyncLeetCode: u.autoSyncLeetCode,
    dailyGoal: u.dailyGoal,
    timezone: u.timezone
  };
}

export async function register(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { username, email, password } = req.body;

  try {
    const exists = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (exists) return res.status(409).json({ message: "Email already registered" });

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({
      username: String(username).trim(),
      email: String(email).toLowerCase().trim(),
      passwordHash
    });

    const token = signToken(String(user._id));
    return res.status(201).json({ token, user: publicUser(user) });
  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function login(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = signToken(String(user._id));
    return res.json({ token, user: publicUser(user) });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export const helpers = { publicUser };
