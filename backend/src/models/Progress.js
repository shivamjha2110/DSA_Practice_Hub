import mongoose from "mongoose";

const ProgressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    question: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true, index: true },
    isSolved: { type: Boolean, default: false, index: true },
    solvedAt: { type: Date },
    isRevisit: { type: Boolean, default: false, index: true },
    revisitAt: { type: Date }
  },
  { timestamps: true }
);

ProgressSchema.index({ user: 1, question: 1 }, { unique: true });
ProgressSchema.index({ user: 1, isSolved: 1 });
ProgressSchema.index({ user: 1, isRevisit: 1 });

export default mongoose.models.Progress || mongoose.model("Progress", ProgressSchema);
