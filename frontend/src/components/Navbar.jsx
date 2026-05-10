import { Bell, LayoutDashboard, Menu, Moon, Search, Sun, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../state/AuthContext.jsx";
import { useTheme } from "../state/ThemeContext.jsx";

const links = [
  ["Home", "/"],
  ["Search", "/search"],
  ["Growth", "/category/growth"],
  ["Strategy", "/category/strategy"]
];

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { user, profile, logout, isAdmin } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-paper/85 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/80">
      <nav className="container-pad flex h-20 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3 font-bold">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-950 text-flame dark:bg-white">Q</span>
          <span className="text-lg">Qalam Thirash</span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map(([label, href]) => (
            <NavLink
              key={href}
              to={href}
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-sm font-semibold transition ${isActive ? "bg-white text-slate-950 shadow-sm dark:bg-white/10 dark:text-white" : "text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white"}`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Link to="/search" className="btn-soft h-10 w-10 px-0" aria-label="Search">
            <Search size={18} />
          </Link>
          <button className="btn-soft h-10 w-10 px-0" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          {user ? (
            <>
              <Link to="/dashboard" className="btn-soft hidden h-10 w-10 px-0 sm:inline-flex" aria-label="Dashboard">
                <LayoutDashboard size={18} />
              </Link>
              {isAdmin && (
                <Link to="/admin" className="hidden rounded-full bg-flame px-4 py-2 text-sm font-bold text-white sm:inline-flex">
                  Admin
                </Link>
              )}
              <button onClick={logout} className="hidden overflow-hidden rounded-full sm:block" title={profile?.name || user.email}>
                <img src={user.photoURL || "/icon.svg"} alt="" className="h-10 w-10 object-cover" />
              </button>
              <Bell className="hidden text-slate-400 lg:block" size={18} />
            </>
          ) : (
            <Link className="btn-primary hidden sm:inline-flex" to="/login">
              Login
            </Link>
          )}
          <button className="btn-soft h-10 w-10 px-0 md:hidden" onClick={() => setOpen((item) => !item)} aria-label="Menu">
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="container-pad pb-5 md:hidden">
          <div className="glass grid gap-2 rounded-3xl p-3">
            {links.map(([label, href]) => (
              <Link key={href} to={href} onClick={() => setOpen(false)} className="rounded-2xl px-4 py-3 font-semibold">
                {label}
              </Link>
            ))}
            <Link to="/dashboard" className="rounded-2xl px-4 py-3 font-semibold">
              Dashboard
            </Link>
            {user ? (
              <button className="rounded-2xl px-4 py-3 text-left font-semibold" onClick={logout}>
                Sign out
              </button>
            ) : (
              <Link to="/login" onClick={() => setOpen(false)} className="rounded-2xl px-4 py-3 text-left font-semibold">
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
