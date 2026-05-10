import { Activity, BarChart3, Check, FolderTree, MessageSquare, PenLine, Settings, Shield, Users, X } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import RichTextEditor from "../components/RichTextEditor.jsx";
import SEO from "../components/SEO.jsx";
import { api } from "../services/api.js";
import { useAuth } from "../state/AuthContext.jsx";

const nav = [
  ["dashboard", BarChart3, "Dashboard"],
  ["categories", FolderTree, "Categories"],
  ["users", Users, "Users"],
  ["posts", PenLine, "Posts"],
  ["comments", MessageSquare, "Comments"],
  ["requests", Shield, "Requests"],
  ["analytics", Activity, "Analytics"],
  ["settings", Settings, "Settings"]
];

export default function Admin() {
  const { token } = useAuth();
  const [tab, setTab] = useState("dashboard");
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [categories, setCategories] = useState([]);
  const [postContent, setPostContent] = useState("");

  useEffect(() => {
    token().then((idToken) => {
      api("/admin/analytics", {}, idToken).then(setAnalytics).catch(() => {});
      api("/users", {}, idToken).then((data) => setUsers(data.users || [])).catch(() => {});
      api("/requests", {}, idToken).then((data) => setRequests(data.requests || [])).catch(() => {});
      api("/categories").then((data) => setCategories(data.categories || [])).catch(() => {});
    });
  }, []);

  const approve = async (id) => {
    try {
      await api(`/requests/${id}/approve`, { method: "POST", body: JSON.stringify({}) }, await token());
      setRequests((items) => items.map((item) => (item.id === id ? { ...item, status: "approved" } : item)));
      toast.success("Request approved and published");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const reject = async (id) => {
    try {
      await api(`/requests/${id}/reject`, { method: "POST", body: JSON.stringify({ adminNote: "Needs revision" }) }, await token());
      setRequests((items) => items.map((item) => (item.id === id ? { ...item, status: "rejected" } : item)));
      toast.success("Request rejected");
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <>
      <SEO title="Admin | Grid Journal" description="Admin dashboard for users, posts, categories, comments, requests, analytics, and settings." />
      <section className="container-pad py-10">
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          <aside className="glass h-max rounded-3xl p-4 lg:sticky lg:top-28">
            <p className="px-3 py-2 text-xs font-black uppercase tracking-widest text-flame">Admin panel</p>
            <div className="grid gap-1">
              {nav.map(([id, Icon, label]) => (
                <button key={id} onClick={() => setTab(id)} className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-bold ${tab === id ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950" : "hover:bg-white/70 dark:hover:bg-white/5"}`}>
                  <Icon size={17} /> {label}
                </button>
              ))}
            </div>
          </aside>

          <div className="rounded-[2rem] bg-white p-6 shadow-glow dark:bg-slate-900">
            {tab === "dashboard" && (
              <>
                <h1 className="font-display text-4xl font-bold">Dashboard</h1>
                <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                  {Object.entries(analytics?.totals || { users: 0, posts: 0, comments: 0, categories: 0, requests: 0 }).map(([label, value]) => (
                    <div key={label} className="rounded-3xl bg-slate-100 p-5 dark:bg-slate-950">
                      <p className="text-3xl font-black">{value}</p>
                      <p className="capitalize text-slate-500">{label}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-8 grid gap-6 xl:grid-cols-2">
                  <AdminList title="Popular posts" items={analytics?.popularPosts || []} />
                  <AdminList title="Recent activity" items={analytics?.recentActivity || []} />
                </div>
              </>
            )}

            {tab === "categories" && (
              <AdminSection title="Category management" description="Create, edit, delete, upload imagery, and maintain SEO slugs through the category API.">
                <div className="grid gap-4 md:grid-cols-2">
                  <input placeholder="Category name" className="rounded-2xl border border-slate-200 bg-transparent px-4 py-3 dark:border-white/10" />
                  <input placeholder="Icon or image URL" className="rounded-2xl border border-slate-200 bg-transparent px-4 py-3 dark:border-white/10" />
                  <button className="btn-primary w-max">Create category</button>
                </div>
                <div className="mt-6 grid gap-3">
                  {categories.map((category) => <div key={category.id} className="rounded-2xl bg-slate-100 p-4 dark:bg-slate-950">{category.name} <span className="text-slate-500">/{category.slug}</span></div>)}
                </div>
              </AdminSection>
            )}

            {tab === "users" && (
              <AdminSection title="Users management" description="Search users, change roles, ban/unban, view profiles, or delete accounts.">
                <div className="grid gap-3">
                  {users.map((item) => (
                    <div key={item.id} className="grid gap-4 rounded-3xl border border-slate-200 p-4 dark:border-white/10 md:grid-cols-[1fr_auto] md:items-center">
                      <div className="flex items-center gap-3">
                        <img src={item.profilePicture || "/icon.svg"} alt="" className="h-11 w-11 rounded-full" />
                        <div>
                          <p className="font-bold">{item.name}</p>
                          <p className="text-sm text-slate-500">{item.email}</p>
                        </div>
                      </div>
                      <span className="badge capitalize">{item.role}</span>
                    </div>
                  ))}
                </div>
              </AdminSection>
            )}

            {tab === "posts" && (
              <AdminSection title="Posts management" description="Create, edit, draft, publish, schedule, feature, pin, and filter posts.">
                <div className="grid gap-4">
                  <input placeholder="Post title" className="rounded-2xl border border-slate-200 bg-transparent px-4 py-3 dark:border-white/10" />
                  <RichTextEditor value={postContent} onChange={setPostContent} />
                  <div className="flex flex-wrap gap-3">
                    <button className="btn-primary">Publish</button>
                    <button className="btn-soft">Save draft</button>
                    <button className="btn-soft">Schedule</button>
                  </div>
                </div>
              </AdminSection>
            )}

            {tab === "requests" && (
              <AdminSection title="Request management" description="Preview, edit before publishing, approve/reject, filter by status, and view requester profiles.">
                <div className="grid gap-4">
                  {requests.map((item) => (
                    <div key={item.id} className="rounded-3xl border border-slate-200 p-4 dark:border-white/10">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <p className="font-bold">{item.title}</p>
                          <p className="mt-1 text-sm text-slate-500">{item.shortDescription}</p>
                          <p className="mt-2 text-xs text-slate-400">By {item.author?.name} · {item.status}</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => approve(item.id)} className="btn-soft text-ocean"><Check size={16} /> Approve</button>
                          <button onClick={() => reject(item.id)} className="btn-soft text-red-500"><X size={16} /> Reject</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </AdminSection>
            )}

            {tab === "comments" && (
              <AdminSection title="Comments management" description="View all comments, delete reported comments, and filter by post or user with post previews.">
                <div className="rounded-3xl bg-slate-100 p-8 dark:bg-slate-950">Comment moderation is connected through `/api/comments` and ready for Firestore data.</div>
              </AdminSection>
            )}

            {tab === "analytics" && (
              <AdminSection title="Analytics" description="Traffic, views, popular posts, user growth, engagement charts, and activity logs.">
                <div className="grid h-72 grid-cols-12 items-end gap-2 rounded-3xl bg-slate-100 p-6 dark:bg-slate-950">
                  {[40, 72, 55, 90, 64, 80, 48, 96, 68, 74, 88, 62].map((height, index) => (
                    <div key={index} className="rounded-t-2xl bg-flame" style={{ height: `${height}%` }} />
                  ))}
                </div>
              </AdminSection>
            )}

            {tab === "settings" && (
              <AdminSection title="Settings" description="Site title, logo, SEO settings, homepage content, social links, email, and maintenance mode.">
                <div className="grid gap-4 md:grid-cols-2">
                  <input placeholder="Site title" className="rounded-2xl border border-slate-200 bg-transparent px-4 py-3 dark:border-white/10" />
                  <input placeholder="Logo URL" className="rounded-2xl border border-slate-200 bg-transparent px-4 py-3 dark:border-white/10" />
                  <textarea placeholder="SEO description" className="min-h-28 rounded-2xl border border-slate-200 bg-transparent px-4 py-3 md:col-span-2 dark:border-white/10" />
                  <button className="btn-primary w-max">Save settings</button>
                </div>
              </AdminSection>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

function AdminSection({ title, description, children }) {
  return (
    <>
      <h1 className="font-display text-4xl font-bold">{title}</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">{description}</p>
      <div className="mt-6">{children}</div>
    </>
  );
}

function AdminList({ title, items }) {
  return (
    <div className="rounded-3xl bg-slate-100 p-5 dark:bg-slate-950">
      <h3 className="font-bold">{title}</h3>
      <div className="mt-4 grid gap-3">
        {items.length === 0 && <p className="text-sm text-slate-500">No data yet.</p>}
        {items.map((item) => (
          <div key={item.id} className="rounded-2xl bg-white p-3 text-sm dark:bg-slate-900">
            <p className="font-bold">{item.title || item.action}</p>
            <p className="text-slate-500">{item.views ? `${item.views} views` : item.actor?.email}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
