import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
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
    const result = await signInWithPopup(auth, googleProvider);
    await syncSession(result.user);
    toast.success("Welcome back");
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
