import mongoose from "mongoose";
import Topic from "../models/Topic.js";
import Question from "../models/Question.js";
import Progress from "../models/Progress.js";

export async function listTopics(req, res) {
  const userId = new mongoose.Types.ObjectId(req.user.id);

  const topics = await Topic.find().sort({ category: 1, name: 1 });

  const solvedAgg = await Progress.aggregate([
    { $match: { user: userId, isSolved: true } },
    { $lookup: { from: "questions", localField: "question", foreignField: "_id", as: "q" } },
    { $unwind: "$q" },
    { $unwind: "$q.topics" },
    { $group: { _id: "$q.topics", count: { $sum: 1 } } }
  ]);

  const revisitAgg = await Progress.aggregate([
    { $match: { user: userId, isRevisit: true } },
    { $lookup: { from: "questions", localField: "question", foreignField: "_id", as: "q" } },
    { $unwind: "$q" },
    { $unwind: "$q.topics" },
    { $group: { _id: "$q.topics", count: { $sum: 1 } } }
  ]);

  const solvedMap = new Map(solvedAgg.map((r) => [String(r._id), r.count]));
  const revisitMap = new Map(revisitAgg.map((r) => [String(r._id), r.count]));

  return res.json({
    topics: topics.map((t) => ({
      id: String(t._id),
      name: t.name,
      slug: t.slug,
      category: t.category,
      total: t.questionCount,
      solved: solvedMap.get(String(t._id)) || 0,
      revisit: revisitMap.get(String(t._id)) || 0
    }))
  });
}

export async function topicQuestions(req, res) {
  const topicId = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(topicId)) {
    return res.status(400).json({ message: "Invalid topic id" });
  }
  const t = await Topic.findById(topicId);
  if (!t) return res.status(404).json({ message: "Topic not found" });

  const userId = new mongoose.Types.ObjectId(req.user.id);
  const questions = await Question.find({ topics: new mongoose.Types.ObjectId(topicId) }).sort({ difficulty: 1, title: 1 });

  const ids = questions.map((q) => q._id);
  const progress = await Progress.find({ user: userId, question: { $in: ids } });
  const pMap = new Map(progress.map((p) => [String(p.question), p]));

  return res.json({
    topic: { id: String(t._id), name: t.name, category: t.category, total: t.questionCount },
    questions: questions.map((q) => {
      const p = pMap.get(String(q._id));
      return {
        id: String(q._id),
        title: q.title,
        link: q.link,
        difficulty: q.difficulty,
        tags: q.tags,
        isSolved: p?.isSolved || false,
        isRevisit: p?.isRevisit || false
      };
    })
  });
}
