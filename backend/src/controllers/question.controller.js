import mongoose from "mongoose";
import Question from "../models/Question.js";
import Progress from "../models/Progress.js";

async function getOrCreateProgress(userId, questionId) {
  let p = await Progress.findOne({ user: userId, question: questionId });
  if (!p) p = await Progress.create({ user: userId, question: questionId });
  return p;
}

export async function toggleSolved(req, res) {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid question id" });

  const q = await Question.findById(id);
  if (!q) return res.status(404).json({ message: "Question not found" });

  const userId = new mongoose.Types.ObjectId(req.user.id);
  const questionId = new mongoose.Types.ObjectId(id);
  const p = await getOrCreateProgress(userId, questionId);

  p.isSolved = !p.isSolved;
  p.solvedAt = p.isSolved ? new Date() : undefined;
  await p.save();

  return res.json({ isSolved: p.isSolved, isRevisit: p.isRevisit });
}

export async function toggleRevisit(req, res) {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid question id" });

  const q = await Question.findById(id);
  if (!q) return res.status(404).json({ message: "Question not found" });

  const userId = new mongoose.Types.ObjectId(req.user.id);
  const questionId = new mongoose.Types.ObjectId(id);
  const p = await getOrCreateProgress(userId, questionId);

  p.isRevisit = !p.isRevisit;
  p.revisitAt = p.isRevisit ? new Date() : undefined;
  await p.save();

  return res.json({ isSolved: p.isSolved, isRevisit: p.isRevisit });
}

export async function revisitList(req, res) {
  const qText = String(req.query.q || "").trim().toLowerCase();
  const difficulty = String(req.query.difficulty || "").trim();

  const userId = new mongoose.Types.ObjectId(req.user.id);

  const prog = await Progress.find({ user: userId, isRevisit: true }).populate("question");

  let rows = prog
    .filter((p) => p.question)
    .map((p) => {
      const qq = p.question;
      return {
        id: String(qq._id),
        title: qq.title,
        link: qq.link,
        difficulty: qq.difficulty,
        tags: qq.tags,
        isSolved: p.isSolved,
        isRevisit: p.isRevisit
      };
    });

  if (difficulty) rows = rows.filter((r) => r.difficulty === difficulty);
  if (qText) rows = rows.filter((r) => r.title.toLowerCase().includes(qText) || String(r.tags || "").toLowerCase().includes(qText));

  // stable sort: revisit first by revisitAt desc, fallback title
  rows.sort((a, b) => a.title.localeCompare(b.title));

  return res.json({ questions: rows });
}
