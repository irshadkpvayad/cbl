import { Layers } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PostCard from "../components/PostCard.jsx";
import SEO from "../components/SEO.jsx";
import { demoPosts } from "../data/demo.js";
import { api, query } from "../services/api.js";

export default function Category() {
  const { slug } = useParams();
  const [posts, setPosts] = useState(demoPosts.filter((post) => post.categorySlug === slug));

  useEffect(() => {
    api(`/posts${query({ category: slug })}`).then((data) => data.posts?.length && setPosts(data.posts)).catch(() => setPosts(demoPosts.filter((post) => post.categorySlug === slug)));
  }, [slug]);

  return (
    <>
      <SEO title={`${slug} Articles | Grid Journal`} description={`Read the latest ${slug} articles.`} />
      <section className="container-pad py-12">
        <div className="rounded-[2rem] bg-slate-950 p-8 text-white dark:bg-white dark:text-slate-950">
          <Layers className="text-flame" />
          <h1 className="mt-5 font-display text-6xl font-bold capitalize">{slug}</h1>
          <p className="mt-3 max-w-2xl opacity-75">Category and subcategory pages use clean URLs, post counts, rich cards, and Firestore filters.</p>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => <PostCard key={post.id} post={post} />)}
        </div>
      </section>
    </>
  );
}
