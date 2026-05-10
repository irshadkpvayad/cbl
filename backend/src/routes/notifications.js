import { Router } from "express";
import { db, FieldValue } from "../config/firebaseAdmin.js";
import { attachUser, requireAuth } from "../middleware/auth.js";
import { toDoc } from "../utils/format.js";

export const notificationRouter = Router();
notificationRouter.use(attachUser);

notificationRouter.get("/", requireAuth, async (req, res, next) => {
  try {
    const snap = await db
      .collection("notifications")
      .where("toUid", "==", req.user.uid)
      .orderBy("createdAt", "desc")
      .limit(50)
      .get();
    res.json({ notifications: snap.docs.map(toDoc) });
  } catch (error) {
    next(error);
  }
});

notificationRouter.put("/:id/read", requireAuth, async (req, res, next) => {
  try {
    await db.collection("notifications").doc(req.params.id).set(
      {
        read: true,
        readAt: FieldValue.serverTimestamp()
      },
      { merge: true }
    );
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});
