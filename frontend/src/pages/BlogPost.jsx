import { Bookmark, ChevronLeft, ChevronRight, Eye, Heart, MessageCircle, Send, Share2, Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Link, useParams } from "react-router-dom";
import PostCard from "../components/PostCard.jsx";
import SEO from "../components/SEO.jsx";
import { demoPosts } from "../data/demo.js";
import { api } from "../services/api.js";
import { compactNumber, formatDate } from "../services/date.js";
import { useAuth } from "../state/AuthContext.jsx";

export default function BlogPost() {
  const { slug } = useParams();
  const { user, token } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const related = useMemo(() => demoPosts.filter((item) => item.slug !== slug).slice(0, 3), [slug]);

  useEffect(() => {
    api(`/posts/${slug}`)
      .then((data) => setPost(data.post))
      .catch(() => setPost(demoPosts.find((item) => item.slug === slug) || demoPosts[0]))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!post?.id) return;
    api(`/comments?postId=${post.id}`).then((data) => setComments(data.comments || [])).catch(() => setComments([]));
  }, [post?.id]);

  const submitComment = async (event) => {
    event.preventDefault();
    if (!user) return toast.error("Sign in to comment");
    const content = new FormData(event.currentTarget).get("content");
    const idToken = await token();
    try {
      const data = await api("/comments", { method: "POST", body: JSON.stringify({ postId: post.id, content }) }, idToken);
      setComments((items) => [data.comment, ...items]);
      event.currentTarget.reset();
      toast.success("Comment posted");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const act = async (path, label) => {
    if (!user) return toast.error("Please sign in first");
    try {
      await api(path, { method: "POST" }, await token());
      toast.success(label);
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (loading || !post) return <div className="container-pad py-24">Loading article...</div>;

  return (
    <>
      <SEO title={`${post.title} | Grid Journal`} description={post.subtitle || post.excerpt} image={post.thumbnail} type="article" />
      <article>
        <header className="container-pad pt-10">
          <div className="mx-auto max-w-4xl text-center">
            <div className="flex justify-center gap-2">
              <span className="badge">{post.category}</span>
              <span className="badge">{post.subcategory || "Featured"}</span>
            </div>
            <h1 className="mt-6 font-display text-5xl font-bold leading-tight sm:text-7xl">{post.title}</h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-400">{post.subtitle || post.excerpt}</p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-4 text-sm text-slate-500">
              <Link to={`/author/${post.author?.uid}`} className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-100">
                <img src={post.author?.profilePicture || "/icon.svg"} alt="" className="h-10 w-10 rounded-full" />
                {post.author?.name || "Editorial Team"}
              </Link>
              <span>{formatDate(post.publishedAt)}</span>
              <span>{post.readTime || 5} min read</span>
              <span>Updated {formatDate(post.lastUpdatedAt)}</span>
            </div>
          </div>
          <img src={post.thumbnail} alt={post.title} className="mt-10 h-[280px] w-full rounded-[2rem] object-cover shadow-glow sm:h-[520px]" />
        </header>

        <div className="container-pad mt-10 grid gap-10 lg:grid-cols-[80px_minmax(0,760px)_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-28 grid gap-3">
              <Action icon={Heart} label={compactNumber(post.likes)} onClick={() => act(`/posts/${post.id}/like`, "Reaction saved")} />
              <Action icon={Bookmark} label="Save" onClick={() => act(`/posts/${post.id}/bookmark`, "Bookmark updated")} />
              <Action icon={Share2} label="Share" onClick={() => navigator.share?.({ title: post.title, url: window.location.href })} />
            </div>
          </aside>

          <div>
            <div className="mb-8 flex flex-wrap gap-3 text-sm text-slate-500">
              <span className="inline-flex items-center gap-1"><Eye size={16} /> {compactNumber(post.views)} views</span>
              <span className="inline-flex items-center gap-1"><MessageCircle size={16} /> {compactNumber(post.commentCount)} comments</span>
              {post.tags?.map((tag) => (
                <Link key={tag} to={`/search?tag=${tag}`} className="badge">#{tag}</Link>
              ))}
            </div>
            <div className="prose-grid text-lg leading-8" dangerouslySetInnerHTML={{ __html: post.content }} />

            <nav className="mt-12 grid gap-4 border-y border-slate-200 py-6 dark:border-white/10 sm:grid-cols-2">
              <Link to={`/post/${related[0]?.slug}`} className="btn-soft justify-start"><ChevronLeft size={18} /> Previous article</Link>
              <Link to={`/post/${related[1]?.slug}`} className="btn-soft justify-end">Next article <ChevronRight size={18} /></Link>
            </nav>

            <section id="comments" className="mt-12">
              <h2 className="font-display text-4xl font-bold">Conversation</h2>
              <form onSubmit={submitComment} className="mt-6 rounded-3xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900">
                <textarea name="content" required placeholder={user ? "Add a thoughtful comment..." : "Sign in to join the discussion"} className="min-h-28 w-full resize-none bg-transparent outline-none" />
                <div className="flex justify-end">
                  <button className="btn-primary"><Send size={16} /> Comment</button>
                </div>
              </form>
              <div className="mt-6 grid gap-4">
                {comments.length === 0 && <p className="text-slate-500">No comments yet. The first good thought gets a strangely satisfying advantage.</p>}
                {comments.map((comment) => (
                  <div key={comment.id} id={`comment-${comment.id}`} className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-slate-900">
                    <div className="flex items-center gap-3">
                      <img src={comment.author?.profilePicture || "/icon.svg"} alt="" className="h-9 w-9 rounded-full" />
                      <div>
                        <p className="font-bold">{comment.author?.name}</p>
                        <p className="text-xs text-slate-500">{formatDate(comment.createdAt)}</p>
                      </div>
                    </div>
                    <div className="mt-3 text-sm leading-6" dangerouslySetInnerHTML={{ __html: comment.content }} />
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="hidden xl:block">
            <div className="sticky top-28 rounded-3xl bg-white p-6 shadow-sm dark:bg-slate-900">
              <h3 className="font-bold">Author</h3>
              <Link to={`/author/${post.author?.uid}`} className="mt-4 flex items-center gap-3">
                <img src={post.author?.profilePicture || "/icon.svg"} alt="" className="h-12 w-12 rounded-full" />
                <div>
                  <p className="font-bold">{post.author?.name}</p>
                  <p className="flex text-flame"><Star size={14} fill="currentColor" /> <Star size={14} fill="currentColor" /> <Star size={14} fill="currentColor" /> <Star size={14} fill="currentColor" /></p>
                </div>
              </Link>
            </div>
          </aside>
        </div>
      </article>

      <section className="container-pad mt-16">
        <h2 className="font-display text-4xl font-bold">Related posts</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {related.map((item) => <PostCard key={item.id} post={item} />)}
        </div>
      </section>
    </>
  );
}

function Action({ icon: Icon, label, onClick }) {
  return (
    <button onClick={onClick} className="btn-soft h-16 w-16 flex-col rounded-2xl px-0 text-xs">
      <Icon size={18} />
      {label}
    </button>
  );
}
