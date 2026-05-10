import "dotenv/config";
import { db, FieldValue, Timestamp } from "../config/firebaseAdmin.js";
import { demoAuthors, demoCategories, demoPosts, demoSubcategories } from "../data/demoContent.js";

function withTimestamps(item) {
  const createdAt = item.createdAt ? Timestamp.fromDate(new Date(item.createdAt)) : FieldValue.serverTimestamp();
  const updatedAt = item.updatedAt ? Timestamp.fromDate(new Date(item.updatedAt)) : FieldValue.serverTimestamp();
  return { ...item, createdAt, updatedAt };
}

function postPayload(post) {
  return {
    ...post,
    publishedAt: Timestamp.fromDate(new Date(post.publishedAt)),
    lastUpdatedAt: post.lastUpdatedAt ? Timestamp.fromDate(new Date(post.lastUpdatedAt)) : Timestamp.fromDate(new Date(post.publishedAt)),
    createdAt: Timestamp.fromDate(new Date(post.publishedAt)),
    updatedAt: FieldValue.serverTimestamp(),
    shareCount: post.shareCount || 0
  };
}

async function seed() {
  const batch = db.batch();

  demoCategories.forEach((category) => {
    batch.set(db.collection("categories").doc(category.id), withTimestamps(category), { merge: true });
  });

  demoSubcategories.forEach((subcategory) => {
    batch.set(db.collection("subcategories").doc(subcategory.id), withTimestamps(subcategory), { merge: true });
  });

  demoAuthors.forEach((author) => {
    batch.set(
      db.collection("users").doc(author.uid),
      {
        ...author,
        isBanned: false,
        joinedAt: Timestamp.fromDate(new Date("2025-01-18T09:00:00.000Z")),
        updatedAt: FieldValue.serverTimestamp()
      },
      { merge: true }
    );
  });

  demoPosts.forEach((post) => {
    batch.set(db.collection("posts").doc(post.id), postPayload(post), { merge: true });
  });

  batch.set(
    db.collection("settings").doc("site"),
    {
      title: "Grid Journal",
      seoDescription: "Modern articles, ideas, and author-led stories.",
      logo: "",
      maintenanceMode: false,
      updatedAt: FieldValue.serverTimestamp()
    },
    { merge: true }
  );

  await batch.commit();
  console.log(`Seeded ${demoPosts.length} posts, ${demoCategories.length} categories, ${demoSubcategories.length} subcategories, and ${demoAuthors.length} users.`);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
