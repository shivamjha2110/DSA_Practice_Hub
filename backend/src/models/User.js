import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, trim: true, minlength: 2, maxlength: 32 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    leetcodeUsername: { type: String, default: "" },
    leetcodeLastSyncAt: { type: Date },
    autoSyncLeetCode: { type: Boolean, default: true },
    dailyGoal: { type: Number, default: 3, min: 1, max: 50 },
    timezone: { type: String, default: "UTC" }
  },
  { timestamps: true }
);

UserSchema.index({ email: 1 }, { unique: true });

export default mongoose.models.User || mongoose.model("User", UserSchema);
