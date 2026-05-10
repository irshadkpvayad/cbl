import { Github, Linkedin, Mail, Twitter } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-slate-200 bg-white/70 py-12 dark:border-white/10 dark:bg-slate-950">
      <div className="container-pad grid gap-8 md:grid-cols-[1.3fr_.7fr_.7fr]">
        <div>
          <div className="flex items-center gap-3 font-bold">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-950 text-flame dark:bg-white">Q</span>
            <span>Qalam Thirash</span>
          </div>
          <p className="mt-4 max-w-md text-sm leading-6 text-slate-600 dark:text-slate-400">
            A modern Firebase-powered publishing platform for author-led articles, reader communities, and editorial workflows.
          </p>
        </div>
        <div className="grid gap-3 text-sm">
          <Link to="/search">Search</Link>
          <Link to="/category/strategy">Strategy</Link>
          <Link to="/category/growth">Growth</Link>
          <Link to="/dashboard">Dashboard</Link>
        </div>
        <div className="flex items-start gap-3">
          {[Twitter, Github, Linkedin, Mail].map((Icon, index) => (
            <button key={index} className="btn-soft h-10 w-10 px-0" aria-label="Social link">
              <Icon size={17} />
            </button>
          ))}
        </div>
      </div>
    </footer>
  );
}
