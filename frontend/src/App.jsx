import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";

const Admin = lazy(() => import("./pages/Admin.jsx"));
const AuthorProfile = lazy(() => import("./pages/AuthorProfile.jsx"));
const BlogPost = lazy(() => import("./pages/BlogPost.jsx"));
const Category = lazy(() => import("./pages/Category.jsx"));
const Dashboard = lazy(() => import("./pages/Dashboard.jsx"));
const Home = lazy(() => import("./pages/Home.jsx"));
const Login = lazy(() => import("./pages/Login.jsx"));
const Search = lazy(() => import("./pages/Search.jsx"));

export default function App() {
  return (
    <Suspense fallback={<div className="container-pad py-24">Loading page...</div>}>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/post/:slug" element={<BlogPost />} />
          <Route path="/search" element={<Search />} />
          <Route path="/category/:slug" element={<Category />} />
          <Route path="/author/:uid" element={<AuthorProfile />} />
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute adminOnly>
                <Admin />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
