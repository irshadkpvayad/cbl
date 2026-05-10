import { Chrome } from "lucide-react";
import { useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import SEO from "../components/SEO.jsx";
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
      <SEO title="Login | Qalam Thirash" description="Login with Google to access Qalam Thirash." />
      <section className="container-pad grid min-h-[70vh] place-items-center py-12">
        <button onClick={handleGoogleLogin} disabled={submitting} className="btn-primary min-w-72 disabled:cursor-not-allowed disabled:opacity-60">
          <Chrome size={18} /> {submitting ? "Opening Google..." : "Continue with Google"}
        </button>
      </section>
    </>
  );
}
