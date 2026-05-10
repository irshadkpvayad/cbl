import { Router } from "express";
import { db, FieldValue } from "../config/firebaseAdmin.js";
import { attachUser, requireAdmin } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { categoryPayload, subcategoryPayload } from "../validators/schemas.js";
import { makeSlug, toDoc } from "../utils/format.js";

export const categoryRouter = Router();
categoryRouter.use(attachUser);

categoryRouter.get("/", async (_req, res, next) => {
  try {
    const [categories, subcategories] = await Promise.all([
      db.collection("categories").orderBy("name").get(),
      db.collection("subcategories").orderBy("name").get()
    ]);
    res.json({ categories: categories.docs.map(toDoc), subcategories: subcategories.docs.map(toDoc) });
  } catch (error) {
    next(error);
  }
});

categoryRouter.post("/", requireAdmin, validate(categoryPayload), async (req, res, next) => {
  try {
    const payload = {
      ...req.body,
      slug: makeSlug(req.body.name),
      postCount: 0,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    };
    const ref = await db.collection("categories").add(payload);
    res.status(201).json({ category: { id: ref.id, ...payload } });
  } catch (error) {
    next(error);
  }
});

categoryRouter.put("/:id", requireAdmin, validate(categoryPayload), async (req, res, next) => {
  try {
    const payload = { ...req.body, slug: makeSlug(req.body.name), updatedAt: FieldValue.serverTimestamp() };
    await db.collection("categories").doc(req.params.id).set(payload, { merge: true });
    res.json({ category: { id: req.params.id, ...payload } });
  } catch (error) {
    next(error);
  }
});

categoryRouter.delete("/:id", requireAdmin, async (req, res, next) => {
  try {
    await db.collection("categories").doc(req.params.id).delete();
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

categoryRouter.post("/subcategories", requireAdmin, validate(subcategoryPayload), async (req, res, next) => {
  try {
    const payload = {
      ...req.body,
      slug: makeSlug(req.body.name),
      categorySlug: makeSlug(req.body.categoryName),
      postCount: 0,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    };
    const ref = await db.collection("subcategories").add(payload);
    res.status(201).json({ subcategory: { id: ref.id, ...payload } });
  } catch (error) {
    next(error);
  }
});

categoryRouter.put("/subcategories/:id", requireAdmin, validate(subcategoryPayload), async (req, res, next) => {
  try {
    const payload = {
      ...req.body,
      slug: makeSlug(req.body.name),
      categorySlug: makeSlug(req.body.categoryName),
      updatedAt: FieldValue.serverTimestamp()
    };
    await db.collection("subcategories").doc(req.params.id).set(payload, { merge: true });
    res.json({ subcategory: { id: req.params.id, ...payload } });
  } catch (error) {
    next(error);
  }
});

categoryRouter.delete("/subcategories/:id", requireAdmin, async (req, res, next) => {
  try {
    await db.collection("subcategories").doc(req.params.id).delete();
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});
