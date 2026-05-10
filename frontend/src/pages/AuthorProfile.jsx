import { Calendar, Link as LinkIcon, Star, UserPlus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import PostCard from "../components/PostCard.jsx";
import SEO from "../components/SEO.jsx";
import { demoPosts } from "../data/demo.js";
import { api } from "../services/api.js";
import { formatDate } from "../services/date.js";
import { useAuth } from "../state/AuthContext.jsx";

export default function AuthorProfile() {
  const { uid } = useParams();
  const { user, token } = useAuth();
  const fallbackPosts = useMemo(() => demoPosts.filter((post) => post.author?.uid === uid || uid?.startsWith("demo")), [uid]);
  const [author, setAuthor] = useState(null);
  const [posts, setPosts] = useState(fallbackPosts);

  useEffect(() => {
    api(`/users/${uid}`)
      .then((data) => {
        setAuthor(data.user);
        setPosts(data.posts?.length ? data.posts : fallbackPosts);
      })
      .catch(() => {
        const sample = fallbackPosts[0]?.author || demoPosts[0].author;
        setAuthor({ ...sample, bio: "SEO specialist and practical strategy writer.", followers: 1240, following: 82, totalPosts: fallbackPosts.length, rating: 4.7, joinedAt: "2025-01-18" });
      });
  }, [fallbackPosts, uid]);

  const follow = async () => {
    if (!user) return toast.error("Sign in to follow authors");
    try {
      await api(`/social/follow/${uid}`, { method: "POST" }, await token());
      toast.success("Follow status updated");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const rate = async (value) => {
    if (!user) return toast.error("Sign in to rate authors");
    try {
      const data = await api(`/social/rate/${uid}`, { method: "POST", body: JSON.stringify({ value }) }, await token());
      setAuthor((item) => ({ ...item, rating: data.rating, ratingCount: data.ratingCount }));
      toast.success("Rating saved");
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (!author) return <div className="container-pad py-24">Loading author...</div>;

  return (
    <>
      <SEO title={`${author.name} | Qalam Thirash`} description={author.bio || "Author profile and posts."} image={author.profilePicture} />
      <section className="container-pad py-12">
        <div className="grid gap-8 rounded-[2rem] bg-white p-6 shadow-glow dark:bg-slate-900 md:grid-cols-[220px_1fr_auto] md:p-10">
          <img src={author.profilePicture || "/icon.svg"} alt={author.name} className="h-44 w-44 rounded-[2rem] object-cover" />
          <div>
            <h1 className="font-display text-5xl font-bold">{author.name}</h1>
            <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-400">{author.bio || "Reader, writer, and community contributor."}</p>
            <div className="mt-5 flex flex-wrap gap-3 text-sm text-slate-500">
              <span className="badge"><Calendar size={14} /> Joined {formatDate(author.joinedAt)}</span>
              <span className="badge"><Star size={14} fill="currentColor" /> {(author.rating || 0).toFixed?.(1) || "0.0"} rating</span>
              <span className="badge">{author.followers || 0} followers</span>
              <span className="badge">{author.following || 0} following</span>
              <span className="badge">{author.totalPosts || posts.length} writings</span>
            </div>
            <div className="mt-5 flex gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button key={value} onClick={() => rate(value)} className="text-flame" aria-label={`Rate ${value}`}>
                  <Star size={22} fill="currentColor" />
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 md:flex-col">
            <button onClick={follow} className="btn-primary"><UserPlus size={17} /> Follow</button>
            <button className="btn-soft"><LinkIcon size={17} /> Website</button>
          </div>
        </div>
        <h2 className="mt-12 font-display text-4xl font-bold">Posts by {author.name}</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => <PostCard key={post.id} post={post} />)}
        </div>
      </section>
    </>
  );
}
