import { motion } from "framer-motion";
import { ArrowRight, Mail, Sparkles, TrendingUp, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import PostCard from "../components/PostCard.jsx";
import SEO from "../components/SEO.jsx";
import Skeleton from "../components/Skeleton.jsx";
import { demoCategories, demoPosts } from "../data/demo.js";
import { api, query } from "../services/api.js";

export default function Home() {
  const [posts, setPosts] = useState(demoPosts);
  const [loading, setLoading] = useState(true);
  const featured = useMemo(() => posts.find((post) => post.featured) || posts[0], [posts]);
  const latest = posts.slice(0, 6);
  const trending = [...posts].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 3);

  useEffect(() => {
    api(`/posts${query({ sort: "newest", limit: 12 })}`)
      .then((data) => data.posts?.length && setPosts(data.posts))
      .catch(() => setPosts(demoPosts))
      .finally(() => setLoading(false));
  }, []);

  const subscribe = async (event) => {
    event.preventDefault();
    const email = new FormData(event.currentTarget).get("email");
    try {
      await api("/social/newsletter", { method: "POST", body: JSON.stringify({ email }) });
      toast.success("Subscribed to the newsletter");
      event.currentTarget.reset();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <>
      <SEO title="Grid Journal | Modern Blog Platform" description="Premium publishing, author profiles, post requests, and Firebase-backed community features." />
      <section className="container-pad pt-8">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden rounded-[2rem] bg-hero-photo bg-cover bg-center p-5 text-white shadow-glow sm:p-8">
          <div className="flex items-center justify-between text-sm">
            <span className="rounded-full bg-white/15 px-4 py-2 font-semibold backdrop-blur">Premium publishing suite</span>
            <Link to="/search" className="hidden items-center gap-2 rounded-full bg-white px-4 py-2 font-bold text-slate-950 sm:flex">
              Explore <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid min-h-[420px] content-end gap-6 py-12 md:grid-cols-[1.15fr_.85fr] md:items-end">
            <div>
              <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-flame px-4 py-2 text-sm font-bold">
                <Sparkles size={16} /> Blog insights
              </p>
              <h1 className="max-w-3xl font-display text-5xl font-bold leading-tight sm:text-7xl">Stories, systems, and ideas worth returning to.</h1>
              <p className="mt-5 max-w-2xl text-lg text-white/80">A full-stack blog platform with Google auth, post workflows, rich editing, analytics, and a reading experience inspired by the best editorial products.</p>
            </div>
            <div className="glass rounded-3xl p-4 text-slate-950 dark:text-white">
              <div className="grid grid-cols-3 gap-3 text-center">
                {[
                  ["18K", "Monthly views"],
                  ["1.2K", "Authors"],
                  ["98%", "Approval SLA"]
                ].map(([value, label]) => (
                  <div key={label} className="rounded-2xl bg-white/75 p-4 dark:bg-slate-950/50">
                    <p className="text-2xl font-black">{value}</p>
                    <p className="mt-1 text-xs text-slate-500">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="container-pad mt-16">
        {loading ? <Skeleton count={3} /> : <PostCard post={featured} featured />}
      </section>

      <section className="container-pad mt-16 grid gap-10 lg:grid-cols-[1fr_360px]">
        <div>
          <SectionTitle icon={TrendingUp} title="Latest posts" href="/search" />
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {latest.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </div>
        <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
          <div className="glass rounded-3xl p-6">
            <SectionTitle icon={Sparkles} title="Trending" compact />
            <div className="mt-5 grid gap-4">
              {trending.map((post, index) => (
                <Link key={post.id} to={`/post/${post.slug}`} className="flex gap-4 rounded-2xl p-2 transition hover:bg-white/60 dark:hover:bg-white/5">
                  <span className="font-display text-3xl font-bold text-flame">{index + 1}</span>
                  <div>
                    <p className="font-bold leading-snug">{post.title}</p>
                    <p className="mt-1 text-xs text-slate-500">{post.views?.toLocaleString()} views</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
          <div className="rounded-3xl bg-slate-950 p-6 text-white dark:bg-white dark:text-slate-950">
            <Users className="text-flame" />
            <h3 className="mt-4 font-display text-3xl font-bold">Author spotlight</h3>
            <p className="mt-3 text-sm opacity-75">Rate authors, follow profiles, save posts, and get realtime notifications when conversations move.</p>
            <Link to="/author/demo-author" className="mt-5 inline-flex font-bold text-flame">
              Meet James Anderson
            </Link>
          </div>
        </aside>
      </section>

      <section className="container-pad mt-16">
        <SectionTitle icon={Sparkles} title="Explore categories" />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {demoCategories.map((category) => (
            <Link key={category.slug} to={`/category/${category.slug}`} className="rounded-3xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-glow dark:border-white/10 dark:bg-slate-900">
              <p className="text-sm font-bold text-flame">{category.postCount} posts</p>
              <h3 className="mt-8 text-2xl font-black">{category.name}</h3>
              <p className="mt-2 text-sm text-slate-500">SEO friendly collections with subcategory support.</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="container-pad mt-16">
        <div className="grid gap-8 rounded-[2rem] bg-white p-6 shadow-glow dark:bg-slate-900 md:grid-cols-[1fr_auto] md:items-center md:p-10">
          <div>
            <Mail className="text-ocean" />
            <h2 className="mt-4 font-display text-4xl font-bold">Weekly editorial signal, no noise.</h2>
            <p className="mt-3 text-slate-600 dark:text-slate-400">Newsletter subscriptions are stored in Firestore and ready for your email provider.</p>
          </div>
          <form onSubmit={subscribe} className="flex flex-col gap-3 sm:flex-row">
            <input name="email" type="email" required placeholder="you@example.com" className="rounded-full border border-slate-200 bg-paper px-5 py-3 outline-none focus:ring-4 focus:ring-ocean/20 dark:border-white/10 dark:bg-slate-950" />
            <button className="btn-primary">Subscribe</button>
          </form>
        </div>
      </section>
    </>
  );
}

function SectionTitle({ icon: Icon, title, href, compact = false }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <h2 className={`${compact ? "text-xl" : "font-display text-4xl"} flex items-center gap-3 font-bold`}>
        <Icon className="text-flame" size={compact ? 20 : 28} /> {title}
      </h2>
      {href && (
        <Link to={href} className="text-sm font-bold text-ocean">
          View all
        </Link>
      )}
    </div>
  );
}
