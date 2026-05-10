import { Router } from "express";
import { db, FieldValue } from "../config/firebaseAdmin.js";
import { attachUser, requireAuth } from "../middleware/auth.js";

export const authRouter = Router();

authRouter.use(attachUser);

authRouter.post("/session", requireAuth, async (req, res, next) => {
  try {
    const ref = db.collection("users").doc(req.user.uid);
    const snap = await ref.get();
    await ref.set({ lastLoginAt: FieldValue.serverTimestamp() }, { merge: true });
    res.json({ user: { id: snap.id, ...snap.data(), role: req.user.role } });
  } catch (error) {
    next(error);
  }
});

authRouter.get("/me", requireAuth, async (req, res, next) => {
  try {
    const snap = await db.collection("users").doc(req.user.uid).get();
    res.json({ user: { id: snap.id, ...snap.data(), role: req.user.role } });
  } catch (error) {
    next(error);
  }
});
