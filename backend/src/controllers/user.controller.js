import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Progress from "../models/Progress.js";

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

export async function me(req, res) {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(401).json({ message: "User not found" });
  return res.json({ user: publicUser(user) });
}

export async function updateProfile(req, res) {
  const { leetcodeUsername } = req.body || {};
  const user = await User.findById(req.user.id);
  if (!user) return res.status(401).json({ message: "User not found" });
  user.leetcodeUsername = String(leetcodeUsername || "").trim();
  await user.save();
  return res.json({ user: publicUser(user) });
}

export async function updatePreferences(req, res) {
  const { dailyGoal, autoSyncLeetCode, timezone } = req.body || {};
  const user = await User.findById(req.user.id);
  if (!user) return res.status(401).json({ message: "User not found" });

  if (dailyGoal !== undefined) {
    const g = Number(dailyGoal);
    if (!Number.isFinite(g) || g < 1 || g > 50) {
      return res.status(400).json({ message: "dailyGoal must be between 1 and 50" });
    }
    user.dailyGoal = g;
  }

  if (autoSyncLeetCode !== undefined) {
    user.autoSyncLeetCode = !!autoSyncLeetCode;
  }

  if (timezone !== undefined) {
    user.timezone = String(timezone || "UTC").trim() || "UTC";
  }

  await user.save();
  return res.json({ user: publicUser(user) });
}

export async function deleteMe(req, res) {
  const { password } = req.body || {};
  if (!password) return res.status(400).json({ message: "Password required" });

  const user = await User.findById(req.user.id);
  if (!user) return res.status(401).json({ message: "User not found" });

  const ok = await bcrypt.compare(String(password), user.passwordHash);
  if (!ok) return res.status(401).json({ message: "Invalid password" });

  // cleanup progress
  await Progress.deleteMany({ user: user._id });
  await User.deleteOne({ _id: user._id });

  return res.json({ ok: true });
}

export const helpers = { publicUser };
