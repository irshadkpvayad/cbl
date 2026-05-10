import { Router } from "express";
import { db, FieldValue } from "../config/firebaseAdmin.js";
import { attachUser, requireActiveUser, requireAdmin } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { requestPayload } from "../validators/schemas.js";
import { estimateReadTime, makeSlug, sanitizeRichText, stripHtml, toDoc } from "../utils/format.js";
import { HttpError } from "../utils/errors.js";

export const requestRouter = Router();
requestRouter.use(attachUser);

requestRouter.get("/", requireActiveUser, async (req, res, next) => {
  try {
    const { status } = req.query;
    let query = db.collection("requests");
    if (req.user.role !== "admin") query = query.where("author.uid", "==", req.user.uid);
    if (status) query = query.where("status", "==", String(status));
    const snap = await query.orderBy("createdAt", "desc").limit(100).get();
    res.json({ requests: snap.docs.map(toDoc) });
  } catch (error) {
    next(error);
  }
});

requestRouter.post("/", requireActiveUser, validate(requestPayload), async (req, res, next) => {
  try {
    const payload = {
      ...req.body,
      slug: makeSlug(req.body.title),
      categorySlug: makeSlug(req.body.category),
      subcategorySlug: makeSlug(req.body.subcategory),
      content: sanitizeRichText(req.body.content),
      author: {
        uid: req.user.uid,
        name: req.user.name || req.user.email,
        email: req.user.email,
        profilePicture: req.user.picture || ""
      },
      status: "pending",
      adminNote: "",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    };
    const ref = await db.collection("requests").add(payload);
    res.status(201).json({ request: { id: ref.id, ...payload } });
  } catch (error) {
    next(error);
  }
});

requestRouter.put("/:id", requireActiveUser, validate(requestPayload), async (req, res, next) => {
  try {
    const ref = db.collection("requests").doc(req.params.id);
    const snap = await ref.get();
    if (!snap.exists) throw new HttpError(404, "Request not found");
    const canEdit = req.user.role === "admin" || (snap.data().author.uid === req.user.uid && snap.data().status === "pending");
    if (!canEdit) throw new HttpError(403, "Not allowed");
    const payload = {
      ...req.body,
      slug: makeSlug(req.body.title),
      categorySlug: makeSlug(req.body.category),
      subcategorySlug: makeSlug(req.body.subcategory),
      content: sanitizeRichText(req.body.content),
      updatedAt: FieldValue.serverTimestamp()
    };
    await ref.set(payload, { merge: true });
    res.json({ request: { id: req.params.id, ...snap.data(), ...payload } });
  } catch (error) {
    next(error);
  }
});

requestRouter.post("/:id/approve", requireAdmin, async (req, res, next) => {
  try {
    const ref = db.collection("requests").doc(req.params.id);
    const snap = await ref.get();
    if (!snap.exists) throw new HttpError(404, "Request not found");
    const request = { ...snap.data(), ...req.body };
    const postPayload = {
      title: request.title,
      subtitle: request.shortDescription || request.subtitle || "",
      thumbnail: request.thumbnail || "",
      content: sanitizeRichText(request.content),
      categoryId: request.categoryId,
      category: request.category,
      categorySlug: makeSlug(request.category),
      subcategoryId: request.subcategoryId || "",
      subcategory: request.subcategory || "",
      subcategorySlug: makeSlug(request.subcategory),
      tags: request.tags || [],
      slug: makeSlug(request.title),
      excerpt: stripHtml(request.content).slice(0, 220),
      readTime: estimateReadTime(request.content),
      author: request.author,
      status: "published",
      featured: false,
      pinned: false,
      views: 0,
      likes: 0,
      commentCount: 0,
      shareCount: 0,
      publishedAt: FieldValue.serverTimestamp(),
      lastUpdatedAt: FieldValue.serverTimestamp(),
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    };
    const postRef = await db.collection("posts").add(postPayload);
    await ref.update({
      status: "approved",
      approvedPostId: postRef.id,
      reviewedBy: req.user.uid,
      reviewedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    });
    await db.collection("users").doc(request.author.uid).update({ totalPosts: FieldValue.increment(1) });
    await notifyRequest(request.author.uid, "approved", postRef.id);
    res.json({ post: { id: postRef.id, ...postPayload } });
  } catch (error) {
    next(error);
  }
});

requestRouter.post("/:id/reject", requireAdmin, async (req, res, next) => {
  try {
    const ref = db.collection("requests").doc(req.params.id);
    const snap = await ref.get();
    if (!snap.exists) throw new HttpError(404, "Request not found");
    await ref.update({
      status: "rejected",
      adminNote: req.body.adminNote || "",
      reviewedBy: req.user.uid,
      reviewedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    });
    await notifyRequest(snap.data().author.uid, "rejected");
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

async function notifyRequest(uid, status, postId = "") {
  await db.collection("notifications").add({
    toUid: uid,
    type: `request_${status}`,
    title: `Your post request was ${status}`,
    body: status === "approved" ? "Your article is now public." : "An admin reviewed your article request.",
    href: postId ? `/post/${postId}` : "/dashboard/requests",
    read: false,
    createdAt: FieldValue.serverTimestamp()
  });
}
