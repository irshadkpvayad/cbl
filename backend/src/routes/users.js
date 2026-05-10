import { Router } from "express";
import { db, FieldValue } from "../config/firebaseAdmin.js";
import { attachUser, requireAdmin, requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { profilePayload } from "../validators/schemas.js";
import { toDoc } from "../utils/format.js";
import { HttpError } from "../utils/errors.js";

export const userRouter = Router();
userRouter.use(attachUser);

userRouter.get("/", requireAdmin, async (req, res, next) => {
  try {
    const q = String(req.query.q || "").toLowerCase();
    const snap = await db.collection("users").orderBy("joinedAt", "desc").limit(200).get();
    let users = snap.docs.map(toDoc);
    if (q) users = users.filter((user) => `${user.name} ${user.email}`.toLowerCase().includes(q));
    res.json({ users });
  } catch (error) {
    next(error);
  }
});

userRouter.get("/:uid", async (req, res, next) => {
  try {
    const snap = await db.collection("users").doc(req.params.uid).get();
    if (!snap.exists) throw new HttpError(404, "User not found");
    const posts = await db.collection("posts").where("author.uid", "==", req.params.uid).where("status", "==", "published").limit(24).get();
    res.json({ user: { id: snap.id, ...snap.data() }, posts: posts.docs.map(toDoc) });
  } catch (error) {
    next(error);
  }
});

userRouter.put("/me/profile", requireAuth, validate(profilePayload), async (req, res, next) => {
  try {
    await db.collection("users").doc(req.user.uid).set(
      {
        ...req.body,
        updatedAt: FieldValue.serverTimestamp()
      },
      { merge: true }
    );
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

userRouter.put("/:uid/admin", requireAdmin, async (req, res, next) => {
  try {
    await db.collection("users").doc(req.params.uid).set(
      {
        role: req.body.role,
        isBanned: Boolean(req.body.isBanned),
        updatedAt: FieldValue.serverTimestamp()
      },
      { merge: true }
    );
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

userRouter.delete("/:uid", requireAdmin, async (req, res, next) => {
  try {
    await db.collection("users").doc(req.params.uid).delete();
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});
