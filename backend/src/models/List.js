import mongoose from "mongoose";

const ListItemSchema = new mongoose.Schema(
  {
    question: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true },
    // 1-based or 0-based ordering from the sheet. We keep it numeric for stable sorting.
    order: { type: Number, default: 0 }
  },
  { _id: false }
);

const ListSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // Grouping for UI: Curated | Difficulty | Topic | Other
    group: { type: String, default: "Other", index: true },
    // Order in UI for stable sorting within a group
    uiOrder: { type: Number, default: 0 },
    // Items (questions) in this sheet/list
    items: { type: [ListItemSchema], default: [] },
    questionCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

ListSchema.index({ slug: 1 }, { unique: true });
ListSchema.index({ group: 1, uiOrder: 1, name: 1 });

export default mongoose.models.List || mongoose.model("List", ListSchema);
