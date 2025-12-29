import mongoose from "mongoose";
import List from "../models/List.js";
import Question from "../models/Question.js";
import Progress from "../models/Progress.js";

function asObjectId(id) {
  return new mongoose.Types.ObjectId(id);
}

export async function listLists(req, res) {
  const userId = asObjectId(req.user.id);
  const group = String(req.query.group || "").trim();

  const match = group ? { group } : {};

  const lists = await List.find(match)
    .select({ name: 1, slug: 1, group: 1, uiOrder: 1, questionCount: 1, items: 1 })
    .sort({ group: 1, uiOrder: 1, name: 1 })
    .lean();

  // Compute per-list solved / revisit counts for this user.
  // We do one aggregation for all lists in the response to keep it fast.
  const listIdToSlug = new Map(lists.map((l) => [String(l._id), l.slug]));
  const listIdToTotal = new Map(lists.map((l) => [String(l._id), l.questionCount || l.items?.length || 0]));

  const listQuestionPairs = lists.flatMap((l) =>
    (l.items || []).map((it) => ({ listId: l._id, q: it.question }))
  );

  // Empty DB / unseeded state
  if (!lists.length || !listQuestionPairs.length) {
    return res.json({
      lists: lists.map((l) => ({
        id: String(l._id),
        name: l.name,
        slug: l.slug,
        group: l.group,
        total: listIdToTotal.get(String(l._id)) || 0,
        solved: 0,
        revisit: 0
      })),
      empty: true
    });
  }

  // Aggregation: unwind list->question mapping, lookup progress for the user
  const agg = await List.aggregate([
    { $match: match },
    { $project: { slug: 1, name: 1, group: 1, uiOrder: 1, questionCount: 1, items: 1 } },
    { $unwind: "$items" },
    {
      $lookup: {
        from: "progresses",
        let: { qid: "$items.question" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$user", userId] },
                  { $eq: ["$question", "$$qid"] }
                ]
              }
            }
          },
          { $project: { isSolved: 1, isRevisit: 1 } }
        ],
        as: "p"
      }
    },
    { $unwind: { path: "$p", preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: "$_id",
        slug: { $first: "$slug" },
        name: { $first: "$name" },
        group: { $first: "$group" },
        uiOrder: { $first: "$uiOrder" },
        total: { $first: "$questionCount" },
        solved: {
          $sum: {
            $cond: [{ $eq: ["$p.isSolved", true] }, 1, 0]
          }
        },
        revisit: {
          $sum: {
            $cond: [{ $eq: ["$p.isRevisit", true] }, 1, 0]
          }
        }
      }
    },
    { $sort: { group: 1, uiOrder: 1, name: 1 } }
  ]);

  // If a list had 0 items, it won't appear in agg (because we $unwind). Merge safely.
  const aggMap = new Map(agg.map((r) => [String(r._id), r]));

  return res.json({
    lists: lists.map((l) => {
      const row = aggMap.get(String(l._id));
      return {
        id: String(l._id),
        name: l.name,
        slug: l.slug,
        group: l.group,
        total: l.questionCount || l.items?.length || 0,
        solved: row?.solved || 0,
        revisit: row?.revisit || 0
      };
    }),
    empty: false
  });
}

export async function listQuestions(req, res) {
  const slug = String(req.params.slug || "").trim().toLowerCase();
  const list = await List.findOne({ slug }).lean();
  if (!list) return res.status(404).json({ message: "List not found" });

  const userId = asObjectId(req.user.id);
  const qids = (list.items || []).map((it) => it.question);
  if (!qids.length) {
    return res.json({
      list: { name: list.name, slug: list.slug, group: list.group, total: 0 },
      questions: [],
      summary: { byDifficulty: {}, byTopic: [] }
    });
  }

  const search = String(req.query.search || "").trim();
  const difficulty = String(req.query.difficulty || "").trim();
  const status = String(req.query.status || "").trim(); // all|solved|unsolved|revisit
  const sort = String(req.query.sort || "order").trim(); // order|difficulty|title

  // Fetch questions in one go
  const questions = await Question.find({ _id: { $in: qids } }).lean();
  const qMap = new Map(questions.map((q) => [String(q._id), q]));

  // Join progress
  const progress = await Progress.find({ user: userId, question: { $in: qids } }).lean();
  const pMap = new Map(progress.map((p) => [String(p.question), p]));

  let merged = (list.items || [])
    .map((it) => {
      const q = qMap.get(String(it.question));
      if (!q) return null;
      const p = pMap.get(String(q._id));
      return {
        id: String(q._id),
        title: q.title,
        link: q.link,
        difficulty: q.difficulty,
        tags: q.tags,
        order: it.order ?? 0,
        isSolved: Boolean(p?.isSolved),
        isRevisit: Boolean(p?.isRevisit)
      };
    })
    .filter(Boolean);

  if (search) {
    const s = search.toLowerCase();
    merged = merged.filter((q) => (q.title || "").toLowerCase().includes(s) || (q.tags || "").toLowerCase().includes(s));
  }
  if (difficulty) {
    merged = merged.filter((q) => String(q.difficulty).toLowerCase() === difficulty.toLowerCase());
  }
  if (status && status !== "all") {
    if (status === "solved") merged = merged.filter((q) => q.isSolved);
    if (status === "unsolved") merged = merged.filter((q) => !q.isSolved);
    if (status === "revisit") merged = merged.filter((q) => q.isRevisit);
  }

  if (sort === "difficulty") {
    const rank = { Easy: 1, Medium: 2, Hard: 3, Unknown: 9 };
    merged.sort((a, b) => (rank[a.difficulty] || 9) - (rank[b.difficulty] || 9) || (a.order - b.order));
  } else if (sort === "title") {
    merged.sort((a, b) => String(a.title).localeCompare(String(b.title)));
  } else {
    merged.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }

  return res.json({
    list: { name: list.name, slug: list.slug, group: list.group, total: qids.length },
    questions: merged
  });
}

export async function listSummary(req, res) {
  const slug = String(req.params.slug || "").trim().toLowerCase();
  const list = await List.findOne({ slug }).lean();
  if (!list) return res.status(404).json({ message: "List not found" });

  const qids = (list.items || []).map((it) => it.question);
  if (!qids.length) {
    return res.json({
      list: { name: list.name, slug: list.slug, group: list.group, total: 0 },
      byDifficulty: { Easy: 0, Medium: 0, Hard: 0, Unknown: 0 },
      byTopic: []
    });
  }

  const byDiff = await Question.aggregate([
    { $match: { _id: { $in: qids } } },
    { $group: { _id: "$difficulty", count: { $sum: 1 } } }
  ]);
  const byDifficulty = { Easy: 0, Medium: 0, Hard: 0, Unknown: 0 };
  for (const r of byDiff) {
    const k = r._id || "Unknown";
    byDifficulty[k] = r.count;
  }

  const byTopic = await Question.aggregate([
    { $match: { _id: { $in: qids } } },
    { $unwind: "$topics" },
    {
      $lookup: {
        from: "topics",
        localField: "topics",
        foreignField: "_id",
        as: "t"
      }
    },
    { $unwind: "$t" },
    { $group: { _id: "$t.name", count: { $sum: 1 } } },
    { $sort: { count: -1, _id: 1 } },
    { $limit: 12 }
  ]);

  return res.json({
    list: { name: list.name, slug: list.slug, group: list.group, total: qids.length },
    byDifficulty,
    byTopic
  });
}
