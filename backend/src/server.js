import "dotenv/config";
import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { adminRouter } from "./routes/admin.js";
import { authRouter } from "./routes/auth.js";
import { categoryRouter } from "./routes/categories.js";
import { commentRouter } from "./routes/comments.js";
import { notificationRouter } from "./routes/notifications.js";
import { postRouter } from "./routes/posts.js";
import { requestRouter } from "./routes/requests.js";
import { socialRouter } from "./routes/social.js";
import { userRouter } from "./routes/users.js";
import { errorHandler, notFound } from "./utils/errors.js";

const app = express();
const port = process.env.PORT || 5000;
const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

app.set("trust proxy", 1);
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(compression());
app.use(cookieParser());
app.use(cors({ origin: clientUrl.split(","), credentials: true }));
app.use(express.json({ limit: "3mb" }));
app.use(express.urlencoded({ extended: true, limit: "3mb" }));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 500,
    standardHeaders: true,
    legacyHeaders: false
  })
);

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "modern-blog-platform-api" });
});

app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/posts", postRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/comments", commentRouter);
app.use("/api/requests", requestRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/social", socialRouter);
app.use("/api/admin", adminRouter);

app.use(notFound);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
