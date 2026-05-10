import { Bookmark, Clock, Eye, Heart, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { compactNumber, formatDate } from "../services/date.js";

export default function PostCard({ post, featured = false }) {
  return (
    <article className={`group overflow-hidden rounded-3xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:shadow-glow dark:border-white/10 dark:bg-slate-900 ${featured ? "md:grid md:grid-cols-[1.1fr_.9fr]" : ""}`}>
      <Link to={`/post/${post.slug}`} className="block overflow-hidden">
        <img src={post.thumbnail || "/icon.svg"} alt={post.title} loading="lazy" className={`w-full object-cover transition duration-500 group-hover:scale-105 ${featured ? "h-80 md:h-full" : "h-48"}`} />
      </Link>
      <div className="flex min-h-full flex-col p-6">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span className="badge">{post.category}</span>
          <span>{formatDate(post.publishedAt)}</span>
          <span className="inline-flex items-center gap-1">
            <Clock size={14} /> {post.readTime || 4} min
          </span>
        </div>
        <Link to={`/post/${post.slug}`} className="mt-4">
          <h3 className={`${featured ? "font-display text-4xl" : "text-xl"} line-clamp-2 font-bold tracking-normal`}>{post.title}</h3>
          <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-400">{post.excerpt || post.subtitle}</p>
        </Link>
        <div className="mt-6 flex items-center justify-between gap-4">
          <Link to={`/author/${post.author?.uid}`} className="flex min-w-0 items-center gap-3">
            <img src={post.author?.profilePicture || "/icon.svg"} alt="" className="h-9 w-9 rounded-full object-cover" />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">{post.author?.name || "Editorial Team"}</p>
              <p className="text-xs text-slate-500">{post.subcategory || "Article"}</p>
            </div>
          </Link>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1">
              <Eye size={14} /> {compactNumber(post.views)}
            </span>
            <span className="inline-flex items-center gap-1">
              <Heart size={14} /> {compactNumber(post.likes)}
            </span>
            <span className="hidden items-center gap-1 sm:inline-flex">
              <MessageCircle size={14} /> {compactNumber(post.commentCount)}
            </span>
            <Bookmark size={15} />
          </div>
        </div>
      </div>
    </article>
  );
}
