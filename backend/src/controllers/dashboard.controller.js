import mongoose from "mongoose";
import { DateTime } from "luxon";
import User from "../models/User.js";
import Question from "../models/Question.js";
import Progress from "../models/Progress.js";

function buildStreak(daysSet, today) {
  // today is ISO date string
  let current = 0;
  let cursor = DateTime.fromISO(today);

  // If today is not in the set, check yesterday.
  // If yesterday is in the set, we count it as valid continuation.
  if (!daysSet.has(cursor.toISODate())) {
    const yesterday = cursor.minus({ days: 1 });
    if (daysSet.has(yesterday.toISODate())) {
      cursor = yesterday;
    }
  }

  while (daysSet.has(cursor.toISODate())) {
    current++;
    cursor = cursor.minus({ days: 1 });
  }

  // best streak
  const days = Array.from(daysSet).sort();
  let best = 0;
  let run = 0;
  let prev = null;
  for (const d of days) {
    if (!prev) {
      run = 1;
    } else {
      const diff = DateTime.fromISO(d).diff(DateTime.fromISO(prev), "days").days;
      run = diff === 1 ? run + 1 : 1;
    }
    if (run > best) best = run;
    prev = d;
  }
  return { current, best };
}

export async function dashboard(req, res) {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(401).json({ message: "User not found" });

  const tz = user.timezone || "UTC";
  const userId = new mongoose.Types.ObjectId(user._id);

  const totalQuestions = await Question.countDocuments();
  const solvedCount = await Progress.countDocuments({ user: userId, isSolved: true });
  const revisitCount = await Progress.countDocuments({ user: userId, isRevisit: true });

  const todayIso = DateTime.now().setZone(tz).toISODate();

  // solved by day (all time)
  const byDayAgg = await Progress.aggregate([
    { $match: { user: userId, isSolved: true, solvedAt: { $type: "date" } } },
    {
      $project: {
        day: {
          $dateToString: {
            date: "$solvedAt",
            format: "%Y-%m-%d",
            timezone: tz
          }
        }
      }
    },
    { $group: { _id: "$day", solved: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);

  const allTimeDaily = {};
  const daysSet = new Set();
  for (const r of byDayAgg) {
    allTimeDaily[r._id] = r.solved;
    if (r.solved > 0) daysSet.add(r._id);
  }

  const solvedToday = allTimeDaily[todayIso] || 0;
  const dailyGoal = user.dailyGoal || 3;
  const goalRemaining = Math.max(0, dailyGoal - solvedToday);

  const { current: streakCurrent, best: streakBest } = buildStreak(daysSet, todayIso);

  // totals by difficulty
  const totalsByDiffAgg = await Question.aggregate([
    { $group: { _id: "$difficulty", total: { $sum: 1 } } }
  ]);
  const totalsByDiff = new Map(totalsByDiffAgg.map((r) => [String(r._id || "Unknown"), r.total]));

  const solvedByDiffAgg = await Progress.aggregate([
    { $match: { user: userId, isSolved: true } },
    { $lookup: { from: "questions", localField: "question", foreignField: "_id", as: "q" } },
    { $unwind: "$q" },
    { $group: { _id: "$q.difficulty", solved: { $sum: 1 } } }
  ]);
  const solvedByDiff = new Map(solvedByDiffAgg.map((r) => [String(r._id || "Unknown"), r.solved]));

  const diffs = ["Easy", "Medium", "Hard", "Unknown"];
  const byDifficulty = {};
  for (const d of diffs) {
    byDifficulty[d] = {
      solved: solvedByDiff.get(d) || 0,
      total: totalsByDiff.get(d) || 0
    };
  }

  // last 30 days series
  const last30Days = [];
  const heatmap90Days = [];

  const start30 = DateTime.now().setZone(tz).startOf("day").minus({ days: 29 });
  const start90 = DateTime.now().setZone(tz).startOf("day").minus({ days: 89 });

  for (let i = 0; i < 30; i++) {
    const day = start30.plus({ days: i }).toISODate();
    last30Days.push({ day, solved: allTimeDaily[day] || 0 });
  }
  for (let i = 0; i < 90; i++) {
    const day = start90.plus({ days: i }).toISODate();
    heatmap90Days.push({ day, count: allTimeDaily[day] || 0 });
  }

  const remainingCount = Math.max(0, totalQuestions - solvedCount);

  return res.json({
    timezone: tz,
    totalQuestions,
    solvedCount,
    remainingCount,
    revisitCount,
    solvedToday,
    dailyGoal,
    goalRemaining,
    streakCurrent,
    streakBest,
    byDifficulty,
    last30Days,
    heatmap90Days,
    allTimeDaily
  });
}
