import { auth, db, FieldValue } from "../config/firebaseAdmin.js";
import { HttpError } from "../utils/errors.js";

const adminEmail = (process.env.ADMIN_EMAIL || "geektyle8@gmail.com").toLowerCase();

export async function attachUser(req, _res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return next();

    const decoded = await auth.verifyIdToken(token);
    const userRef = db.collection("users").doc(decoded.uid);
    const userSnap = await userRef.get();
    const role = decoded.email?.toLowerCase() === adminEmail ? "admin" : userSnap.data()?.role || "user";

    req.user = {
      uid: decoded.uid,
      email: decoded.email,
      name: decoded.name,
      picture: decoded.picture,
      role
    };

    if (!userSnap.exists) {
      await userRef.set({
        uid: decoded.uid,
        email: decoded.email,
        name: decoded.name || decoded.email,
        profilePicture: decoded.picture || "",
        bio: "",
        role,
        totalPosts: 0,
        totalComments: 0,
        rating: 0,
        ratingCount: 0,
        followers: 0,
        following: 0,
        isBanned: false,
        joinedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      });
    } else if (userSnap.data()?.role !== role || userSnap.data()?.profilePicture !== decoded.picture) {
      await userRef.set(
        {
          role,
          name: decoded.name || userSnap.data()?.name,
          profilePicture: decoded.picture || userSnap.data()?.profilePicture || "",
          updatedAt: FieldValue.serverTimestamp()
        },
        { merge: true }
      );
    }

    next();
  } catch (error) {
    next(error);
  }
}

export function requireAuth(req, _res, next) {
  if (!req.user) return next(new HttpError(401, "Authentication required"));
  next();
}

export async function requireActiveUser(req, _res, next) {
  if (!req.user) return next(new HttpError(401, "Authentication required"));
  const snap = await db.collection("users").doc(req.user.uid).get();
  if (snap.data()?.isBanned) return next(new HttpError(403, "Account is banned"));
  next();
}

export function requireAdmin(req, _res, next) {
  if (!req.user) return next(new HttpError(401, "Authentication required"));
  if (req.user.role !== "admin") return next(new HttpError(403, "Admin access required"));
  next();
}
