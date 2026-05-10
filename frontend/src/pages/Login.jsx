import { Chrome, ShieldCheck } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Navigate, useLocation } from "react-router-dom";
import SEO from "../components/SEO.jsx";
import { hasFirebaseWebConfig } from "../firebase.js";
import { useAuth } from "../state/AuthContext.jsx";

export default function Login() {
  const { user, login } = useAuth();
  const location = useLocation();
  const [submitting, setSubmitting] = useState(false);
  const target = location.state?.from || "/dashboard";

  const handleGoogleLogin = async () => {
    setSubmitting(true);
    try {
      await login();
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  if (user) return <Navigate to={target} replace />;

  return (
    <>
      <SEO title="Sign in | Grid Journal" description="Sign in with Google to comment, save posts, follow authors, and request articles." />
      <section className="container-pad grid min-h-[70vh] place-items-center py-12">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] bg-white shadow-glow dark:bg-slate-900 md:grid-cols-2">
          <div className="bg-hero-photo bg-cover bg-center p-10 text-white">
            <ShieldCheck className="text-flame" size={34} />
            <h1 className="mt-32 font-display text-5xl font-bold">Google-only authentication.</h1>
            <p className="mt-4 text-white/75">The platform assigns admin rights automatically to geektyle8@gmail.com and stores all user profile metrics in Firestore.</p>
          </div>
          <div className="p-8 sm:p-12">
            <h2 className="font-display text-4xl font-bold">Welcome back</h2>
            <p className="mt-3 text-slate-600 dark:text-slate-400">Use your Google account to unlock dashboard, comments, bookmarks, ratings, and notifications.</p>
            {!hasFirebaseWebConfig && (
              <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-100">
                Firebase web config is missing. Add `frontend/.env` values before Google sign-in can open.
              </div>
            )}
            <button onClick={handleGoogleLogin} disabled={submitting || !hasFirebaseWebConfig} className="btn-primary mt-8 w-full disabled:cursor-not-allowed disabled:opacity-60">
              <Chrome size={18} /> {submitting ? "Opening Google..." : "Continue with Google"}
            </button>
            <p className="mt-6 rounded-2xl bg-slate-100 p-4 text-sm text-slate-600 dark:bg-slate-950 dark:text-slate-400">
              No email/password accounts are supported by design. This keeps identity simple and role assignment auditable.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
