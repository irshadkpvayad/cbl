import { Router } from "express";
import { db, FieldValue } from "../config/firebaseAdmin.js";
import { attachUser, requireActiveUser, requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { commentPayload } from "../validators/schemas.js";
import { sanitizeRichText, toDoc } from "../utils/format.js";
import { HttpError } from "../utils/errors.js";

export const commentRouter = Router();
commentRouter.use(attachUser);

commentRouter.get("/", async (req, res, next) => {
  try {
    const { postId, sort = "newest", reported } = req.query;
    let query = db.collection("comments");
    if (postId) query = query.where("postId", "==", String(postId));
    if (reported === "true") query = query.where("reported", "==", true);
    query = query.orderBy(sort === "popular" ? "likes" : "createdAt", "desc").limit(100);
    const snap = await query.get();
    res.json({ comments: snap.docs.map(toDoc) });
  } catch (error) {
    next(error);
  }
});

commentRouter.post("/", requireActiveUser, validate(commentPayload), async (req, res, next) => {
  try {
    const payload = {
      ...req.body,
      content: sanitizeRichText(req.body.content),
      author: {
        uid: req.user.uid,
        name: req.user.name || req.user.email,
        email: req.user.email,
        profilePicture: req.user.picture || ""
      },
      likes: 0,
      reported: false,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    };
    const ref = await db.collection("comments").add(payload);
    await db.collection("posts").doc(req.body.postId).update({ commentCount: FieldValue.increment(1) });
    await db.collection("users").doc(req.user.uid).update({ totalComments: FieldValue.increment(1) });
    await notifyMentions(req.body.mentions, req.user, req.body.postId, ref.id);
    res.status(201).json({ comment: { id: ref.id, ...payload } });
  } catch (error) {
    next(error);
  }
});

commentRouter.put("/:id", requireAuth, async (req, res, next) => {
  try {
    const ref = db.collection("comments").doc(req.params.id);
    const snap = await ref.get();
    if (!snap.exists) throw new HttpError(404, "Comment not found");
    if (snap.data().author.uid !== req.user.uid && req.user.role !== "admin") throw new HttpError(403, "Not allowed");
    await ref.update({ content: sanitizeRichText(req.body.content || ""), edited: true, updatedAt: FieldValue.serverTimestamp() });
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

commentRouter.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    const ref = db.collection("comments").doc(req.params.id);
    const snap = await ref.get();
    if (!snap.exists) throw new HttpError(404, "Comment not found");
    if (snap.data().author.uid !== req.user.uid && req.user.role !== "admin") throw new HttpError(403, "Not allowed");
    await ref.delete();
    await db.collection("posts").doc(snap.data().postId).update({ commentCount: FieldValue.increment(-1) });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

commentRouter.post("/:id/like", requireAuth, async (req, res, next) => {
  try {
    const id = `${req.user.uid}_${req.params.id}`;
    const likeRef = db.collection("commentLikes").doc(id);
    const commentRef = db.collection("comments").doc(req.params.id);
    const like = await likeRef.get();
    if (like.exists) {
      await likeRef.delete();
      await commentRef.update({ likes: FieldValue.increment(-1) });
      return res.json({ liked: false });
    }
    await likeRef.set({ uid: req.user.uid, commentId: req.params.id, createdAt: FieldValue.serverTimestamp() });
    await commentRef.update({ likes: FieldValue.increment(1) });
    res.json({ liked: true });
  } catch (error) {
    next(error);
  }
});

commentRouter.post("/:id/report", requireAuth, async (req, res, next) => {
  try {
    await db.collection("comments").doc(req.params.id).set(
      {
        reported: true,
        reports: FieldValue.arrayUnion({
          uid: req.user.uid,
          reason: req.body.reason || "Reported by user",
          createdAt: new Date().toISOString()
        })
      },
      { merge: true }
    );
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

async function notifyMentions(mentions, actor, postId, commentId) {
  if (!mentions?.length) return;
  const writes = mentions.map((uid) =>
    db.collection("notifications").add({
      toUid: uid,
      type: "mention",
      title: `${actor.name || actor.email} mentioned you`,
      body: "You were mentioned in a comment.",
      href: `/post/${postId}#comment-${commentId}`,
      read: false,
      createdAt: FieldValue.serverTimestamp()
    })
  );
  await Promise.all(writes);
}
