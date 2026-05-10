import { Router } from "express";
import { db } from "../config/firebaseAdmin.js";
import { attachUser, requireAdmin } from "../middleware/auth.js";
import { toDoc } from "../utils/format.js";

export const adminRouter = Router();
adminRouter.use(attachUser, requireAdmin);

adminRouter.get("/analytics", async (_req, res, next) => {
  try {
    const [users, posts, comments, categories, requests, logs] = await Promise.all([
      db.collection("users").count().get(),
      db.collection("posts").count().get(),
      db.collection("comments").count().get(),
      db.collection("categories").count().get(),
      db.collection("requests").count().get(),
      db.collection("activityLogs").orderBy("createdAt", "desc").limit(20).get()
    ]);

    const popular = await db.collection("posts").where("status", "==", "published").orderBy("views", "desc").limit(8).get();
    res.json({
      totals: {
        users: users.data().count,
        posts: posts.data().count,
        comments: comments.data().count,
        categories: categories.data().count,
        requests: requests.data().count
      },
      popularPosts: popular.docs.map(toDoc),
      recentActivity: logs.docs.map(toDoc)
    });
  } catch (error) {
    next(error);
  }
});

adminRouter.get("/settings", async (_req, res, next) => {
  try {
    const snap = await db.collection("settings").doc("site").get();
    res.json({
      settings: snap.exists
        ? snap.data()
        : {
            title: "Grid Journal",
            seoDescription: "Modern articles, ideas, and author-led stories.",
            logo: "",
            socialLinks: {},
            maintenanceMode: false
          }
    });
  } catch (error) {
    next(error);
  }
});

adminRouter.put("/settings", async (req, res, next) => {
  try {
    await db.collection("settings").doc("site").set(req.body, { merge: true });
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});
