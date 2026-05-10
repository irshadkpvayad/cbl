import { getRedirectResult, onAuthStateChanged, signInWithPopup, signInWithRedirect, signOut } from "firebase/auth";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { auth, googleProvider, storage } from "../firebase.js";
import { api } from "../services/api.js";

const AuthContext = createContext(null);
const adminEmail = "geektyle8@gmail.com";

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const syncSession = useCallback(async (user) => {
    if (!user) {
      setProfile(null);
      return;
    }
    const token = await user.getIdToken();
    const data = await api("/auth/session", { method: "POST" }, token);
    setProfile(data.user);
  }, []);

  useEffect(() => {
    getRedirectResult(auth)
      .then(async (result) => {
        if (result?.user) {
          await syncSession(result.user);
          toast.success("Welcome back");
        }
      })
      .catch((error) => {
        console.error(error);
        toast.error(firebaseAuthMessage(error));
      });

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      try {
        await syncSession(user);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    });
    return unsubscribe;
  }, [syncSession]);

  const login = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await syncSession(result.user);
      toast.success("Welcome back");
    } catch (error) {
      if (["auth/popup-blocked", "auth/cancelled-popup-request", "auth/popup-closed-by-user"].includes(error.code)) {
        await signInWithRedirect(auth, googleProvider);
        return;
      }
      toast.error(firebaseAuthMessage(error));
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
    setProfile(null);
    toast.success("Signed out");
  };

  const token = async () => firebaseUser?.getIdToken();

  const uploadImage = async (file, folder = "post-images") => {
    if (!firebaseUser) throw new Error("Please sign in first");
    const path = `${folder}/${firebaseUser.uid}/${Date.now()}-${file.name}`;
    const snap = await uploadBytes(ref(storage, path), file, { contentType: file.type });
    return getDownloadURL(snap.ref);
  };

  const value = useMemo(
    () => ({
      user: firebaseUser,
      profile: profile || (firebaseUser ? { role: firebaseUser.email === adminEmail ? "admin" : "user" } : null),
      loading,
      login,
      logout,
      token,
      uploadImage,
      isAdmin: profile?.role === "admin" || firebaseUser?.email === adminEmail
    }),
    [firebaseUser, loading, profile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

function firebaseAuthMessage(error) {
  if (error?.code === "auth/unauthorized-domain") {
    return "This domain is not authorized in Firebase Authentication settings.";
  }
  if (error?.code === "auth/operation-not-allowed") {
    return "Enable Google sign-in in Firebase Authentication.";
  }
  if (error?.code === "auth/invalid-api-key") {
    return "Firebase web API key is invalid or missing.";
  }
  return error?.message || "Google sign-in failed";
}
