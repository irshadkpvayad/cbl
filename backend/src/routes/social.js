import { Router } from "express";
import { db, FieldValue } from "../config/firebaseAdmin.js";
import { attachUser, requireAuth } from "../middleware/auth.js";
import { HttpError } from "../utils/errors.js";

export const socialRouter = Router();
socialRouter.use(attachUser);

socialRouter.post("/follow/:uid", requireAuth, async (req, res, next) => {
  try {
    if (req.params.uid === req.user.uid) throw new HttpError(400, "You cannot follow yourself");
    const id = `${req.user.uid}_${req.params.uid}`;
    const ref = db.collection("followers").doc(id);
    const snap = await ref.get();
    if (snap.exists) {
      await ref.delete();
      await Promise.all([
        db.collection("users").doc(req.user.uid).update({ following: FieldValue.increment(-1) }),
        db.collection("users").doc(req.params.uid).update({ followers: FieldValue.increment(-1) })
      ]);
      return res.json({ following: false });
    }
    await ref.set({ followerUid: req.user.uid, followingUid: req.params.uid, createdAt: FieldValue.serverTimestamp() });
    await Promise.all([
      db.collection("users").doc(req.user.uid).update({ following: FieldValue.increment(1) }),
      db.collection("users").doc(req.params.uid).update({ followers: FieldValue.increment(1) }),
      db.collection("notifications").add({
        toUid: req.params.uid,
        type: "follow",
        title: `${req.user.name || req.user.email} followed you`,
        body: "You have a new follower.",
        href: `/author/${req.user.uid}`,
        read: false,
        createdAt: FieldValue.serverTimestamp()
      })
    ]);
    res.json({ following: true });
  } catch (error) {
    next(error);
  }
});

socialRouter.post("/rate/:uid", requireAuth, async (req, res, next) => {
  try {
    const value = Math.min(5, Math.max(1, Number(req.body.value || 0)));
    const id = `${req.user.uid}_${req.params.uid}`;
    await db.collection("ratings").doc(id).set({
      fromUid: req.user.uid,
      toUid: req.params.uid,
      value,
      updatedAt: FieldValue.serverTimestamp()
    });
    const snap = await db.collection("ratings").where("toUid", "==", req.params.uid).get();
    const values = snap.docs.map((doc) => Number(doc.data().value || 0));
    const rating = values.reduce((sum, item) => sum + item, 0) / Math.max(values.length, 1);
    await Promise.all([
      db.collection("users").doc(req.params.uid).set({ rating, ratingCount: values.length }, { merge: true }),
      db.collection("notifications").add({
        toUid: req.params.uid,
        type: "rating",
        title: "New author rating",
        body: `${req.user.name || req.user.email} rated your profile.`,
        href: `/author/${req.params.uid}`,
        read: false,
        createdAt: FieldValue.serverTimestamp()
      })
    ]);
    res.json({ rating, ratingCount: values.length });
  } catch (error) {
    next(error);
  }
});

socialRouter.post("/newsletter", async (req, res, next) => {
  try {
    const email = String(req.body.email || "").toLowerCase().trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new HttpError(422, "Valid email required");
    await db.collection("newsletter").doc(email).set({ email, subscribedAt: FieldValue.serverTimestamp() }, { merge: true });
    res.status(201).json({ ok: true });
  } catch (error) {
    next(error);
  }
});
