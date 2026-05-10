import { Router } from "express";
import { db, FieldValue, Timestamp } from "../config/firebaseAdmin.js";
import { attachUser, requireActiveUser, requireAdmin, requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { postPayload } from "../validators/schemas.js";
import { estimateReadTime, makeSlug, sanitizeRichText, stripHtml, toDoc, trendScore } from "../utils/format.js";
import { HttpError } from "../utils/errors.js";

export const postRouter = Router();
postRouter.use(attachUser);

postRouter.get("/", async (req, res, next) => {
  try {
    const {
      category,
      subcategory,
      author,
      tag,
      q,
      sort = "newest",
      limit = "12",
      cursor
    } = req.query;
    let query = db.collection("posts").where("status", "==", "published");

    if (category) query = query.where("categorySlug", "==", String(category));
    if (subcategory) query = query.where("subcategorySlug", "==", String(subcategory));
    if (author) query = query.where("author.uid", "==", String(author));
    if (tag) query = query.where("tags", "array-contains", String(tag));

    const orderField = sort === "oldest" ? "publishedAt" : sort === "popular" ? "views" : "publishedAt";
    const direction = sort === "oldest" ? "asc" : "desc";
    query = query.orderBy(orderField, direction).limit(Math.min(Number(limit) || 12, 30));
    if (cursor) query = query.startAfter(Number(cursor));

    const snap = await query.get();
    let posts = snap.docs.map(toDoc);
    if (q) {
      const needle = String(q).toLowerCase();
      posts = posts.filter((post) => {
        const haystack = `${post.title} ${post.subtitle} ${post.tags?.join(" ")} ${stripHtml(post.content)}`.toLowerCase();
        return haystack.includes(needle);
      });
    }

    if (sort === "trending") {
      posts = posts.sort((a, b) => trendScore(b) - trendScore(a));
    }

    const last = snap.docs.at(-1);
    res.json({
      posts,
      nextCursor: last ? last.get(orderField) : null
    });
  } catch (error) {
    next(error);
  }
});

postRouter.get("/suggestions", async (req, res, next) => {
  try {
    const needle = String(req.query.q || "").toLowerCase();
    if (!needle) return res.json({ suggestions: [] });
    const snap = await db.collection("posts").where("status", "==", "published").orderBy("publishedAt", "desc").limit(30).get();
    const suggestions = snap.docs
      .map(toDoc)
      .filter((post) => `${post.title} ${post.tags?.join(" ")}`.toLowerCase().includes(needle))
      .slice(0, 8)
      .map((post) => ({ id: post.id, title: post.title, slug: post.slug, thumbnail: post.thumbnail }));
    res.json({ suggestions });
  } catch (error) {
    next(error);
  }
});

postRouter.get("/:slug", async (req, res, next) => {
  try {
    const snap = await db.collection("posts").where("slug", "==", req.params.slug).limit(1).get();
    if (snap.empty) throw new HttpError(404, "Post not found");
    const doc = snap.docs[0];
    await doc.ref.update({ views: FieldValue.increment(1), lastViewedAt: FieldValue.serverTimestamp() });
    res.json({ post: { id: doc.id, ...doc.data(), views: Number(doc.data().views || 0) + 1 } });
  } catch (error) {
    next(error);
  }
});

postRouter.post("/", requireAdmin, validate(postPayload), async (req, res, next) => {
  try {
    const payload = buildPostPayload(req.body, req.user);
    const ref = await db.collection("posts").add(payload);
    await logActivity(req.user, "created_post", { postId: ref.id, title: payload.title });
    res.status(201).json({ post: { id: ref.id, ...payload } });
  } catch (error) {
    next(error);
  }
});

postRouter.put("/:id", requireAdmin, validate(postPayload), async (req, res, next) => {
  try {
    const payload = buildPostPayload(req.body, req.user, true);
    const ref = db.collection("posts").doc(req.params.id);
    await ref.set(payload, { merge: true });
    await logActivity(req.user, "updated_post", { postId: req.params.id, title: payload.title });
    res.json({ post: { id: req.params.id, ...payload } });
  } catch (error) {
    next(error);
  }
});

postRouter.delete("/:id", requireAdmin, async (req, res, next) => {
  try {
    await db.collection("posts").doc(req.params.id).delete();
    await logActivity(req.user, "deleted_post", { postId: req.params.id });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

postRouter.post("/:id/like", requireActiveUser, async (req, res, next) => {
  try {
    const id = `${req.user.uid}_${req.params.id}`;
    const likeRef = db.collection("postLikes").doc(id);
    const like = await likeRef.get();
    const postRef = db.collection("posts").doc(req.params.id);
    if (like.exists) {
      await likeRef.delete();
      await postRef.update({ likes: FieldValue.increment(-1) });
      return res.json({ liked: false });
    }
    await likeRef.set({ uid: req.user.uid, postId: req.params.id, createdAt: FieldValue.serverTimestamp() });
    await postRef.update({ likes: FieldValue.increment(1) });
    res.json({ liked: true });
  } catch (error) {
    next(error);
  }
});

postRouter.post("/:id/bookmark", requireAuth, async (req, res, next) => {
  try {
    const id = `${req.user.uid}_${req.params.id}`;
    const ref = db.collection("bookmarks").doc(id);
    const snap = await ref.get();
    if (snap.exists) {
      await ref.delete();
      return res.json({ bookmarked: false });
    }
    await ref.set({ uid: req.user.uid, postId: req.params.id, createdAt: FieldValue.serverTimestamp() });
    res.json({ bookmarked: true });
  } catch (error) {
    next(error);
  }
});

function buildPostPayload(body, user, isUpdate = false) {
  const now = FieldValue.serverTimestamp();
  const titleSlug = makeSlug(body.title);
  const publishedAt =
    body.status === "scheduled" && body.scheduledAt
      ? Timestamp.fromDate(new Date(body.scheduledAt))
      : body.status === "published"
        ? now
        : null;

  return {
    ...body,
    slug: titleSlug,
    categorySlug: makeSlug(body.category),
    subcategorySlug: makeSlug(body.subcategory),
    content: sanitizeRichText(body.content),
    excerpt: stripHtml(body.content).slice(0, 220),
    readTime: estimateReadTime(body.content),
    author: {
      uid: user.uid,
      name: user.name || user.email,
      email: user.email,
      profilePicture: user.picture || ""
    },
    publishedAt,
    lastUpdatedAt: now,
    updatedAt: now,
    ...(isUpdate
      ? {}
      : {
          createdAt: now,
          views: 0,
          likes: 0,
          commentCount: 0,
          shareCount: 0
        })
  };
}

async function logActivity(user, action, metadata) {
  await db.collection("activityLogs").add({
    action,
    metadata,
    actor: { uid: user.uid, email: user.email, name: user.name || user.email },
    createdAt: FieldValue.serverTimestamp()
  });
}
