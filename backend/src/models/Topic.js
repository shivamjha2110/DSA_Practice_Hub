import mongoose from "mongoose";

const TopicSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    category: { type: String, default: "Topic" }, // "Curated" or "Topic"
    questionCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

TopicSchema.index({ slug: 1 }, { unique: true });

export default mongoose.models.Topic || mongoose.model("Topic", TopicSchema);
