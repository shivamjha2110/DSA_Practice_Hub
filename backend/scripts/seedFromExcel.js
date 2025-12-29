import "dotenv/config";
import fs from "fs";
import path from "path";
import xlsx from "xlsx";
import { connectDB } from "../src/utils/db.js";
import Topic from "../src/models/Topic.js";
import Question from "../src/models/Question.js";
import List from "../src/models/List.js";
import { slugify } from "../src/utils/slug.js";

function normDifficulty(v) {
  const s = String(v || "").trim().toLowerCase();
  if (s.startsWith("e")) return "Easy";
  if (s.startsWith("m")) return "Medium";
  if (s.startsWith("h")) return "Hard";
  return s ? s[0].toUpperCase()+s.slice(1) : "Unknown";
}

function safeNum(v) {
  const n = Number(String(v ?? "").replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function titleFromUrl(url) {
  try {
    const m = String(url).match(/leetcode\.com\/problems\/([^/]+)/i);
    const slug = m?.[1];
    if (!slug) return null;
    return slug
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  } catch {
    return null;
  }
}

function leetcodeSlugFromUrl(url) {
  const m = String(url).match(/leetcode\.com\/problems\/([^/]+)/i);
  return m?.[1] || "";
}

function findHeaderRow(rows) {
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i].map((c) => String(c || "").trim().toLowerCase());
    if (row.includes("question") && (row.includes("difficulty") || row.includes("level"))) {
      return i;
    }
  }
  return -1;
}

function colIndex(headerRow, name) {
  const lower = headerRow.map((c) => String(c || "").trim().toLowerCase());
  return lower.indexOf(name);
}

function colIndexAny(headerRow, names) {
  for (const n of names) {
    const i = colIndex(headerRow, n);
    if (i >= 0) return i;
  }
  return -1;
}

function inferListGroup(sheetName) {
  const s = sheetName.toLowerCase();
  if (s.includes("must do")) return { group: "Curated", uiOrder: 10 };
  if (s.includes("can do")) return { group: "Curated", uiOrder: 20 };
  if (s.includes("optional")) return { group: "Curated", uiOrder: 30 };
  if (s.startsWith("easy ") || s === "easy questions") return { group: "Difficulty", uiOrder: 10 };
  if (s.startsWith("medium ") || s === "medium questions") return { group: "Difficulty", uiOrder: 20 };
  if (s.startsWith("hard ") || s === "hard questions") return { group: "Difficulty", uiOrder: 30 };
  // A lot of sheets are actual topic names (Array, Graph, Two Pointers, ...)
  // We treat everything else as Topic by default; "Other" is only for empty or meta sheets.
  if (s.includes("crack the coding interview")) return { group: "Other", uiOrder: 0 };
  return { group: "Topic", uiOrder: 100 };
}

async function main() {
  const excelPath = process.env.SEED_EXCEL_PATH || "../Crack The Coding Interview.xlsx";
  const resolved = path.resolve(process.cwd(), excelPath);
  if (!fs.existsSync(resolved)) {
    console.error("❌ Excel file not found at:", resolved);
    console.error("Set SEED_EXCEL_PATH in backend/.env (relative to backend folder)\n");
    process.exit(1);
  }

  await connectDB();

  if (String(process.env.CLEAR_DB || "").toLowerCase() === "true") {
    console.log("⚠️ CLEAR_DB=true -> clearing Topic + Question + List collections");
    await Topic.deleteMany({});
    await Question.deleteMany({});
    await List.deleteMany({});
  }

  console.log("📘 Reading:", resolved);
  const wb = xlsx.readFile(resolved, { cellDates: true });
  const sheets = wb.SheetNames || [];

  let insertedQuestions = 0;
  let updatedQuestions = 0;
  let insertedTopics = 0;
  let insertedLists = 0;

  for (const sheetName of sheets) {
    const sheet = wb.Sheets[sheetName];
    if (!sheet) continue;

    const rows = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: "" });
    if (!rows.length) continue;

    const headerIdx = findHeaderRow(rows);
    // If no header, still try to parse with a best guess: first col might be question/link
    const header = headerIdx >= 0 ? rows[headerIdx] : [];

    const qCol = headerIdx >= 0 ? colIndex(header, "question") : -1;
    const diffCol = headerIdx >= 0 ? (colIndex(header, "difficulty") >= 0 ? colIndex(header, "difficulty") : colIndex(header, "level")) : -1;
    const topicCol = headerIdx >= 0 ? colIndex(header, "topic") : -1;
    const tagsCol = headerIdx >= 0 ? (colIndex(header, "tags") >= 0 ? colIndex(header, "tags") : colIndex(header, "tag")) : -1;
    const orderCol = headerIdx >= 0 ? colIndexAny(header, ["#", "s.no", "sno", "sr no", "sr.", "index"]) : -1;

    const startRow = headerIdx >= 0 ? headerIdx + 1 : 0;

    // Create / update List (one per sheet)
    const { group, uiOrder } = inferListGroup(sheetName);
    const listSlug = slugify(sheetName);
    let list = await List.findOne({ slug: listSlug });
    if (!list) {
      list = await List.create({ name: sheetName, slug: listSlug, group, uiOrder, items: [], questionCount: 0 });
      insertedLists++;
    } else {
      const changed = list.name !== sheetName || list.group !== group || list.uiOrder !== uiOrder;
      if (changed) {
        list.name = sheetName;
        list.group = group;
        list.uiOrder = uiOrder;
      }
      // We'll replace items based on current workbook to keep it deterministic.
      list.items = [];
      list.questionCount = 0;
      await list.save();
    }

    const seenQ = new Set();
    const items = [];

    // Parse rows and upsert questions/topics; also populate list items
    for (let r = startRow; r < rows.length; r++) {
      const row = rows[r];
      if (!row || row.every((x) => String(x).trim() === "")) continue;

      const rawQuestion = qCol >= 0 ? row[qCol] : row.find((cell) => String(cell).includes("http")) || "";
      const link = String(rawQuestion || "").trim();
      if (!link) continue;

      // Topic name inference
      const rowTopic = topicCol >= 0 ? String(row[topicCol] || "").trim() : "";
      const topicName = rowTopic || sheetName;

      const topicSlug = slugify(topicName);
      let topic = await Topic.findOne({ slug: topicSlug });
      if (!topic) {
        topic = await Topic.create({ name: topicName, slug: topicSlug, category: "Topic" });
        insertedTopics++;
      }

      const difficulty = normDifficulty(diffCol >= 0 ? row[diffCol] : "Unknown");
      const tags = String(tagsCol >= 0 ? row[tagsCol] : "").trim();

      const leetcodeSlug = leetcodeSlugFromUrl(link);
      const derivedTitle = titleFromUrl(link);
      const title = derivedTitle || String(rawQuestion).trim() || link;

      let qdoc = await Question.findOne({ link });
      if (!qdoc) {
        qdoc = await Question.create({
          title,
          link,
          difficulty,
          tags,
          leetcodeSlug,
          topics: [topic._id]
        });
        insertedQuestions++;
      } else {
        let changed = false;
        if (!qdoc.topics.some((x) => String(x) === String(topic._id))) {
          qdoc.topics.push(topic._id);
          changed = true;
        }
        if (!qdoc.leetcodeSlug && leetcodeSlug) {
          qdoc.leetcodeSlug = leetcodeSlug;
          changed = true;
        }
        if (qdoc.difficulty === "Unknown" && difficulty !== "Unknown") {
          qdoc.difficulty = difficulty;
          changed = true;
        }
        if (!qdoc.tags && tags) {
          qdoc.tags = tags;
          changed = true;
        }
        if (!qdoc.title && title) {
          qdoc.title = title;
          changed = true;
        }

        if (changed) {
          await qdoc.save();
          updatedQuestions++;
        }
      }

      // Add to sheet/list items
      const qid = String(qdoc._id);
      if (!seenQ.has(qid)) {
        seenQ.add(qid);
        const order = orderCol >= 0 ? safeNum(row[orderCol]) : 0;
        items.push({ question: qdoc._id, order });
      }
    }

    // Save list items (sorted)
    items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    await List.updateOne(
      { _id: list._id },
      { $set: { items, questionCount: items.length, group, uiOrder, name: sheetName } }
    );
  }

  // Update questionCount for each topic
  const topics = await Topic.find();
  for (const t of topics) {
    const cnt = await Question.countDocuments({ topics: t._id });
    if (t.questionCount !== cnt) {
      t.questionCount = cnt;
      await t.save();
    }
  }

  console.log("✅ Seed complete");
  console.log("Topics added:", insertedTopics);
  console.log("Lists added:", insertedLists);
  console.log("Questions added:", insertedQuestions);
  console.log("Questions updated:", updatedQuestions);

  process.exit(0);
}

main().catch((e) => {
  console.error("❌ Seed failed:", e);
  process.exit(1);
});
