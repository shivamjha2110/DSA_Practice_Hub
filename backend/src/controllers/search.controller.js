import mongoose from "mongoose";
import Topic from "../models/Topic.js";
import Question from "../models/Question.js";
import Progress from "../models/Progress.js";

export async function globalSearch(req, res) {
  const q = String(req.query.q || "").trim();
  const limit = Math.min(200, Math.max(1, Number(req.query.limit || 80)));
  if (!q) return res.json({ topics: [], questions: [] });

  const userId = new mongoose.Types.ObjectId(req.user.id);

  const topicPromise = Topic.find({ name: { $regex: q, $options: "i" } })
    .sort({ name: 1 })
    .limit(20);

  const questionPromise = Question.find({
    $or: [{ title: { $regex: q, $options: "i" } }, { tags: { $regex: q, $options: "i" } }]
  })
    .sort({ title: 1 })
    .limit(limit);

  const [topics, questions] = await Promise.all([topicPromise, questionPromise]);

  const ids = questions.map((x) => x._id);
  const progress = await Progress.find({ user: userId, question: { $in: ids } });
  const pMap = new Map(progress.map((p) => [String(p.question), p]));

  return res.json({
    topics: topics.map((t) => ({ id: String(t._id), name: t.name, category: t.category })),
    questions: questions.map((qq) => {
      const p = pMap.get(String(qq._id));
      return {
        id: String(qq._id),
        title: qq.title,
        link: qq.link,
        difficulty: qq.difficulty,
        tags: qq.tags,
        isSolved: p?.isSolved || false,
        isRevisit: p?.isRevisit || false
      };
    })
  });
}
