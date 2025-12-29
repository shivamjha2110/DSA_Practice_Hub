import mongoose from "mongoose";

let cached = global.__MONGOOSE_CONN__;
if (!cached) {
  cached = global.__MONGOOSE_CONN__ = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!process.env.MONGO_URI) {
    throw new Error("Missing MONGO_URI in environment variables");
  }
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGO_URI, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 15000,
      })
      .then((m) => m);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
