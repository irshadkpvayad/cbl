import { Bell, Bookmark, FileText, MessageSquare, Send, Star, User, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import RichTextEditor from "../components/RichTextEditor.jsx";
import SEO from "../components/SEO.jsx";
import { demoCategories } from "../data/demo.js";
import { api } from "../services/api.js";
import { formatDate } from "../services/date.js";
import { useAuth } from "../state/AuthContext.jsx";

const initialRequest = {
  title: "",
  shortDescription: "",
  thumbnail: "",
  content: "",
  categoryId: "strategy",
  category: "Strategy",
  subcategoryId: "",
  subcategory: "",
  tags: []
};

export default function Dashboard() {
  const { profile, user, token, uploadImage } = useAuth();
  const [tab, setTab] = useState("overview");
  const [requests, setRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [form, setForm] = useState(initialRequest);
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    token().then((idToken) => {
      api("/requests", {}, idToken).then((data) => setRequests(data.requests || [])).catch(() => setRequests([]));
      api("/notifications", {}, idToken).then((data) => setNotifications(data.notifications || [])).catch(() => setNotifications([]));
    });
  }, []);

  const stats = useMemo(
    () => [
      [FileText, profile?.totalPosts || 0, "Total posts"],
      [MessageSquare, profile?.totalComments || 0, "Comments"],
      [Users, profile?.followers || 0, "Followers"],
      [Star, (profile?.rating || 0).toFixed?.(1) || "0.0", "Rating"]
    ],
    [profile]
  );

  const submitRequest = async (event) => {
    event.preventDefault();
    try {
      const idToken = await token();
      const payload = { ...form, tags: tagInput.split(",").map((tag) => tag.trim()).filter(Boolean) };
      const data = await api("/requests", { method: "POST", body: JSON.stringify(payload) }, idToken);
      setRequests((items) => [data.request, ...items]);
      setForm(initialRequest);
      setTagInput("");
      toast.success("Post request submitted");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const uploadThumbnail = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadImage(file);
      setForm((item) => ({ ...item, thumbnail: url }));
      toast.success("Thumbnail uploaded");
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <>
      <SEO title="Dashboard | Qalam Thirash" description="User dashboard for profile, requests, comments, saves, notifications, follows, and ratings." />
      <section className="container-pad py-10">
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          <aside className="glass h-max rounded-3xl p-4 lg:sticky lg:top-28">
            <div className="flex items-center gap-3 p-3">
              <img src={user?.photoURL || "/icon.svg"} alt="" className="h-12 w-12 rounded-full" />
              <div className="min-w-0">
                <p className="truncate font-bold">{profile?.name || user?.displayName}</p>
                <p className="truncate text-xs text-slate-500">{user?.email}</p>
              </div>
            </div>
            <div className="mt-3 grid gap-1">
              {[
                ["overview", User, "My profile"],
                ["request", Send, "Request post"],
                ["requests", FileText, "My requested posts"],
                ["saved", Bookmark, "Saved posts"],
                ["notifications", Bell, "Notifications"],
                ["analytics", Star, "Rating analytics"]
              ].map(([id, Icon, label]) => (
                <button key={id} onClick={() => setTab(id)} className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-bold transition ${tab === id ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950" : "hover:bg-white/70 dark:hover:bg-white/5"}`}>
                  <Icon size={17} /> {label}
                </button>
              ))}
            </div>
          </aside>

          <div>
            {tab === "overview" && (
              <Panel title="Profile">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {stats.map(([Icon, value, label]) => (
                    <div key={label} className="rounded-3xl bg-slate-100 p-5 dark:bg-slate-950">
                      <Icon className="text-flame" />
                      <p className="mt-5 text-3xl font-black">{value}</p>
                      <p className="text-sm text-slate-500">{label}</p>
                    </div>
                  ))}
                </div>
                <form className="mt-8 grid gap-4 md:grid-cols-2">
                  <input defaultValue={profile?.name || ""} placeholder="Name" className="rounded-2xl border border-slate-200 bg-transparent px-4 py-3 dark:border-white/10" />
                  <input defaultValue={user?.email || ""} disabled className="rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 dark:border-white/10 dark:bg-slate-950" />
                  <textarea defaultValue={profile?.bio || ""} placeholder="Bio" className="min-h-32 rounded-2xl border border-slate-200 bg-transparent px-4 py-3 md:col-span-2 dark:border-white/10" />
                  <button type="button" className="btn-primary md:w-max">Save profile</button>
                </form>
              </Panel>
            )}

            {tab === "request" && (
              <Panel title="Request a post">
                <form onSubmit={submitRequest} className="grid gap-5">
                  <div className="grid gap-4 md:grid-cols-2">
                    <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Headline/title" className="rounded-2xl border border-slate-200 bg-transparent px-4 py-3 dark:border-white/10" />
                    <label className="rounded-2xl border border-dashed border-slate-300 px-4 py-3 text-sm font-bold dark:border-white/10">
                      Upload thumbnail
                      <input type="file" accept="image/*" onChange={uploadThumbnail} className="hidden" />
                    </label>
                  </div>
                  {form.thumbnail && <img src={form.thumbnail} alt="" className="h-52 rounded-3xl object-cover" />}
                  <textarea required value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} placeholder="Short description" className="min-h-24 rounded-2xl border border-slate-200 bg-transparent px-4 py-3 dark:border-white/10" />
                  <div className="grid gap-4 md:grid-cols-3">
                    <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value, categoryId: e.target.value.toLowerCase() })} className="rounded-2xl border border-slate-200 bg-transparent px-4 py-3 dark:border-white/10">
                      {demoCategories.map((category) => <option key={category.id}>{category.name}</option>)}
                    </select>
                    <input value={form.subcategory} onChange={(e) => setForm({ ...form, subcategory: e.target.value })} placeholder="Subcategory" className="rounded-2xl border border-slate-200 bg-transparent px-4 py-3 dark:border-white/10" />
                    <input value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="Tags, comma separated" className="rounded-2xl border border-slate-200 bg-transparent px-4 py-3 dark:border-white/10" />
                  </div>
                  <RichTextEditor value={form.content} onChange={(content) => setForm({ ...form, content })} />
                  <button className="btn-primary w-max"><Send size={17} /> Submit for approval</button>
                </form>
              </Panel>
            )}

            {tab === "requests" && (
              <Panel title="My requested posts">
                <RequestList requests={requests} />
              </Panel>
            )}

            {tab === "notifications" && (
              <Panel title="Notifications">
                <div className="grid gap-3">
                  {notifications.length === 0 && <p className="text-slate-500">No notifications yet.</p>}
                  {notifications.map((item) => (
                    <div key={item.id} className="rounded-2xl bg-slate-100 p-4 dark:bg-slate-950">
                      <p className="font-bold">{item.title}</p>
                      <p className="text-sm text-slate-500">{item.body}</p>
                    </div>
                  ))}
                </div>
              </Panel>
            )}

            {["saved", "analytics"].includes(tab) && (
              <Panel title={tab === "saved" ? "Saved posts" : "Rating analytics"}>
                <div className="rounded-3xl bg-slate-100 p-8 text-slate-600 dark:bg-slate-950 dark:text-slate-400">
                  This area is wired for Firestore collections and ready to show bookmarks, following, reading history, and rating trends as data accumulates.
                </div>
              </Panel>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

function Panel({ title, children }) {
  return (
    <div className="rounded-[2rem] bg-white p-6 shadow-glow dark:bg-slate-900">
      <h1 className="font-display text-4xl font-bold">{title}</h1>
      <div className="mt-6">{children}</div>
    </div>
  );
}

function RequestList({ requests }) {
  if (!requests.length) return <p className="text-slate-500">No post requests yet.</p>;
  return (
    <div className="grid gap-4">
      {requests.map((request) => (
        <div key={request.id} className="grid gap-3 rounded-3xl border border-slate-200 p-4 dark:border-white/10 md:grid-cols-[100px_1fr_auto]">
          <img src={request.thumbnail || "/icon.svg"} alt="" className="h-24 w-full rounded-2xl object-cover" />
          <div>
            <p className="font-bold">{request.title}</p>
            <p className="mt-1 text-sm text-slate-500">{request.shortDescription}</p>
            <p className="mt-2 text-xs text-slate-400">{formatDate(request.createdAt)}</p>
          </div>
          <span className={`badge h-max capitalize ${request.status === "approved" ? "text-ocean" : request.status === "rejected" ? "text-red-500" : "text-flame"}`}>{request.status}</span>
        </div>
      ))}
    </div>
  );
}
