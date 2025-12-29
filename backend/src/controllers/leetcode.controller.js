import axios from "axios";
import mongoose from "mongoose";
import User from "../models/User.js";
import Question from "../models/Question.js";
import Progress from "../models/Progress.js";

const LC_ENDPOINT = "https://leetcode.com/graphql";

async function lcGraphQL(query, variables) {
  const { data } = await axios.post(
    LC_ENDPOINT,
    { query, variables },
    {
      headers: {
        "content-type": "application/json",
        "user-agent": "algobloom/1.0"
      },
      timeout: 15000
    }
  );
  if (data?.errors?.length) {
    const msg = data.errors[0]?.message || "LeetCode GraphQL error";
    throw new Error(msg);
  }
  return data?.data;
}

export async function getProfile(req, res) {
  const username = String(req.params.username || "").trim();
  if (!username) return res.status(400).json({ message: "Missing username" });

  try {
    const q = `
      query userProfile($username: String!) {
        matchedUser(username: $username) {
          username
          profile {
            userAvatar
            ranking
            reputation
          }
          submitStatsGlobal {
            acSubmissionNum {
              difficulty
              count
            }
          }
        }
      }
    `;

    const data = await lcGraphQL(q, { username });
    const u = data?.matchedUser;
    if (!u) return res.status(404).json({ message: "LeetCode user not found" });

    const byDiff = {};
    for (const row of u.submitStatsGlobal?.acSubmissionNum || []) {
      byDiff[row.difficulty] = row.count;
    }

    return res.json({
      username: u.username,
      avatar: u.profile?.userAvatar,
      ranking: u.profile?.ranking,
      reputation: u.profile?.reputation,
      // Frontend expects these exact keys
      easySolved: byDiff.Easy ?? 0,
      mediumSolved: byDiff.Medium ?? 0,
      hardSolved: byDiff.Hard ?? 0,
      totalSolved: byDiff.All ?? 0
    });
  } catch (e) {
    console.error("LeetCode profile error:", e.message);
    return res.status(502).json({ message: "LeetCode fetch failed. Try again later." });
  }
}

export async function syncSolved(req, res) {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(401).json({ message: "User not found" });

  const username = String(user.leetcodeUsername || "").trim();
  if (!username) return res.status(400).json({ message: "Set LeetCode username first" });

  const limit = Math.min(200, Math.max(10, Number(process.env.LEETCODE_SYNC_LIMIT || 50)));

  try {
    const q = `
      query recentAcSubmissions($username: String!, $limit: Int!) {
        recentAcSubmissionList(username: $username, limit: $limit) {
          title
          titleSlug
          timestamp
        }
      }
    `;

    const data = await lcGraphQL(q, { username, limit });
    const list = data?.recentAcSubmissionList || [];

    const slugs = Array.from(new Set(list.map((x) => x.titleSlug).filter(Boolean)));
    if (!slugs.length) {
      user.leetcodeLastSyncAt = new Date();
      await user.save();
      return res.json({ matched: 0, markedSolved: 0 });
    }

    const questions = await Question.find({ leetcodeSlug: { $in: slugs } }, { _id: 1, leetcodeSlug: 1 });
    const slugToId = new Map(questions.map((qq) => [qq.leetcodeSlug, qq._id]));

    const userId = new mongoose.Types.ObjectId(user._id);

    let matched = 0;
    let markedSolved = 0;

    for (const slug of slugs) {
      const qid = slugToId.get(slug);
      if (!qid) continue;
      matched++;

      /*
      const existing = await Progress.findOne({ user: userId, question: qid });
      if (!existing) {
        // Disabled auto-marking per user request
        // await Progress.create({ user: userId, question: qid, isSolved: true, solvedAt: new Date() });
        // markedSolved++;
      } else if (!existing.isSolved) {
        // existing.isSolved = true;
        // existing.solvedAt = existing.solvedAt || new Date();
        // await existing.save();
        // markedSolved++;
      }
      */
    }

    user.leetcodeLastSyncAt = new Date();
    await user.save();

    return res.json({ matched, markedSolved });
  } catch (e) {
    console.error("LeetCode sync error:", e.message);
    return res.status(502).json({ message: "LeetCode sync failed. Try later." });
  }
}
