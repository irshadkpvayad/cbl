import { Filter, Search as SearchIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import PostCard from "../components/PostCard.jsx";
import SEO from "../components/SEO.jsx";
import { demoCategories, demoPosts } from "../data/demo.js";
import { api, query } from "../services/api.js";

export default function Search() {
  const [params] = useSearchParams();
  const [filters, setFilters] = useState({ q: params.get("q") || "", tag: params.get("tag") || "", category: "", sort: "newest" });
  const [posts, setPosts] = useState(demoPosts);
  const [visible, setVisible] = useState(6);
  const sentinel = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      api(`/posts${query({ ...filters, limit: 24 })}`).then((data) => data.posts?.length && setPosts(data.posts)).catch(() => setPosts(demoPosts));
    }, 250);
    return () => clearTimeout(timer);
  }, [filters]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) setVisible((value) => Math.min(value + 3, filtered.length));
    });
    if (sentinel.current) observer.observe(sentinel.current);
    return () => observer.disconnect();
  });

  const filtered = useMemo(() => {
    const q = filters.q.toLowerCase();
    return posts
      .filter((post) => (!q || `${post.title} ${post.excerpt} ${post.tags?.join(" ")}`.toLowerCase().includes(q)))
      .filter((post) => (!filters.category || post.categorySlug === filters.category))
      .filter((post) => (!filters.tag || post.tags?.includes(filters.tag)))
      .sort((a, b) => (filters.sort === "popular" ? b.views - a.views : filters.sort === "oldest" ? new Date(a.publishedAt) - new Date(b.publishedAt) : new Date(b.publishedAt) - new Date(a.publishedAt)));
  }, [filters, posts]);

  return (
    <>
      <SEO title="Search Articles | Qalam Thirash" description="Live search articles by topic, author, category, popularity, and tags." />
      <section className="container-pad py-12">
        <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
          <aside className="glass h-max rounded-3xl p-5 lg:sticky lg:top-28">
            <div className="flex items-center gap-2 font-bold"><Filter size={18} /> Filters</div>
            <label className="mt-5 block text-sm font-bold">Search</label>
            <div className="mt-2 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-slate-950">
              <SearchIcon size={18} className="text-slate-400" />
              <input value={filters.q} onChange={(event) => setFilters({ ...filters, q: event.target.value })} placeholder="Search posts, tags, authors..." className="w-full bg-transparent outline-none" />
            </div>
            <label className="mt-5 block text-sm font-bold">Category</label>
            <select value={filters.category} onChange={(event) => setFilters({ ...filters, category: event.target.value })} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-slate-950">
              <option value="">All categories</option>
              {demoCategories.map((category) => <option key={category.slug} value={category.slug}>{category.name}</option>)}
            </select>
            <label className="mt-5 block text-sm font-bold">Sort</label>
            <select value={filters.sort} onChange={(event) => setFilters({ ...filters, sort: event.target.value })} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-slate-950">
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="popular">Popularity</option>
            </select>
            <label className="mt-5 block text-sm font-bold">Tag</label>
            <input value={filters.tag} onChange={(event) => setFilters({ ...filters, tag: event.target.value })} placeholder="seo" className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none dark:border-white/10 dark:bg-slate-950" />
          </aside>
          <div>
            <h1 className="font-display text-5xl font-bold">Search the library</h1>
            <p className="mt-3 text-slate-600 dark:text-slate-400">{filtered.length} articles found with live filtering and infinite loading.</p>
            <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filtered.slice(0, visible).map((post) => <PostCard key={post.id} post={post} />)}
            </div>
            <div ref={sentinel} className="h-16" />
          </div>
        </div>
      </section>
    </>
  );
}
