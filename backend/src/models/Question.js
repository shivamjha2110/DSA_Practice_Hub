import mongoose from "mongoose";

const QuestionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    link: { type: String, required: true, unique: true, trim: true },
    leetcodeSlug: { type: String, index: true },
    difficulty: { type: String, default: "Unknown" },
    tags: { type: String, default: "" },
    topics: [{ type: mongoose.Schema.Types.ObjectId, ref: "Topic" }]
  },
  { timestamps: true }
);

QuestionSchema.index({ link: 1 }, { unique: true });
QuestionSchema.index({ leetcodeSlug: 1 });

export default mongoose.models.Question || mongoose.model("Question", QuestionSchema);
