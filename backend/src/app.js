import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import xss from "xss-clean";
import hpp from "hpp";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import topicRoutes from "./routes/topic.routes.js";
import listRoutes from "./routes/list.routes.js";
import questionRoutes from "./routes/question.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import leetcodeRoutes from "./routes/leetcode.routes.js";
import searchRoutes from "./routes/search.routes.js";

const app = express();

app.set("trust proxy", 1);

app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        "http://localhost:5173",
        "https://algobloom.vercel.app"
      ];
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        return callback(new Error("The CORS policy for this site does not allow access from the specified Origin."), false);
      }
      return callback(null, true);
    },
    credentials: true
  })
);
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(xss());
app.use(hpp());
app.use(morgan("dev"));

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 600,
    standardHeaders: true,
    legacyHeaders: false
  })
);

app.get("/", (req, res) => res.json({ ok: true, name: "AlgoBloom API" }));

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/topics", topicRoutes);
app.use("/api/lists", listRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/leetcode", leetcodeRoutes);
app.use("/api/search", searchRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error("API Error:", err);
  res.status(500).json({ message: "Internal server error" });
});

export default app;
