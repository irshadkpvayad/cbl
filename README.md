# Grid Journal Blog Platform

A full-stack modern blog platform built with React + Vite + Tailwind CSS, Node.js + Express, and Firebase Authentication, Firestore, Storage, Hosting, and notification-ready Firestore feeds.

## Features

- Google-only authentication with automatic admin assignment for `geektyle8@gmail.com`
- Firebase Admin verified API protection and role-based admin middleware
- Firestore collections for users, posts, categories, subcategories, comments, requests, ratings, notifications, followers, bookmarks, activity logs, and newsletter subscribers
- Public homepage, featured/trending/latest posts, category pages, author profiles, live search, related posts, sharing, bookmarks, likes, and nested-ready comments
- User dashboard with profile, post requests, saved posts, notifications, follow/rating analytics placeholders
- Admin panel with analytics, category/user/post/comment/request/settings sections
- Post request approval flow that publishes approved requests as public posts
- Rich text editor with headings, formatting, images, links, code blocks, quotes, tables, and drag/upload-ready image support
- Firebase Storage uploads for avatars, post images, and category images
- Dark/light mode, responsive UI, skeleton loading, toast notifications, PWA manifest/service worker, SEO metadata, robots, sitemap
- Security rules, rate limiting, Helmet, validation, rich text sanitization, and secure upload limits

## Project Structure

```text
.
├── backend
│   ├── src
│   │   ├── config
│   │   ├── middleware
│   │   ├── routes
│   │   ├── utils
│   │   └── validators
│   ├── .env.example
│   └── package.json
├── frontend
│   ├── public
│   ├── src
│   │   ├── components
│   │   ├── data
│   │   ├── pages
│   │   ├── services
│   │   └── state
│   ├── .env.example
│   └── package.json
├── firebase.json
├── firestore.rules
├── firestore.indexes.json
├── storage.rules
└── package.json
```

## Firebase Setup

1. Create a Firebase project.
2. Enable Google Authentication in Authentication > Sign-in method.
3. Create Firestore Database in production mode.
4. Enable Firebase Storage.
5. Create a Firebase Admin service account key.
6. Copy `frontend/.env.example` to `frontend/.env` and fill the web app values.
7. Copy `backend/.env.example` to `backend/.env` and fill the service account values.
8. Deploy rules and indexes:

```bash
firebase deploy --only firestore:rules,firestore:indexes,storage
```

The backend automatically stores new Google users and assigns:

- `admin` when email is `geektyle8@gmail.com`
- `user` for all other Google accounts

### Service Account File

For local development, keep the Firebase Admin service account outside source control:

```text
.secrets/firebase-service-account.json
```

`backend/.env` is already configured to read that file using `FIREBASE_SERVICE_ACCOUNT_PATH=../.secrets/firebase-service-account.json`.

Do not commit or paste private keys into code. If a key has been shared in chat or logs, revoke it in Google Cloud IAM and generate a new service account key before production use.

## Seed Firestore With Starter Content

After adding the service account JSON file, push the starter users, categories, subcategories, settings, and posts into Firestore:

```bash
npm run seed --prefix backend
```

The homepage and post pages will then load the seeded Firestore posts through the API instead of relying on frontend fallback data.

## Local Development

Install all dependencies:

```bash
npm run install:all
npm install
```

Run frontend and backend together:

```bash
npm run dev
```

Or run each service:

```bash
npm run dev --prefix backend
npm run dev --prefix frontend
```

Frontend: `http://localhost:5173`

Backend: `http://localhost:5000/api/health`

## API Overview

- `POST /api/auth/session` syncs a Firebase ID token to a Firestore user profile
- `GET /api/posts` lists public posts with filters and sorting
- `GET /api/posts/:slug` reads a post and increments views
- `POST /api/posts` admin creates posts
- `POST /api/posts/:id/like` toggles likes
- `POST /api/posts/:id/bookmark` toggles bookmarks
- `GET /api/comments?postId=...` lists comments
- `POST /api/comments` creates comments for signed-in users
- `GET /api/requests` lists current user's requests, or all requests for admins
- `POST /api/requests` creates a post request
- `POST /api/requests/:id/approve` publishes a request as a public post
- `POST /api/requests/:id/reject` rejects a request
- `GET /api/admin/analytics` returns admin totals, popular posts, and recent activity

## Firestore Collections

The app uses these top-level collections:

```text
users
posts
categories
subcategories
comments
requests
ratings
notifications
followers
bookmarks
postLikes
commentLikes
activityLogs
newsletter
settings
```

## Deployment

Build the frontend:

```bash
npm run build
```

Deploy Firebase Hosting:

```bash
firebase deploy --only hosting
```

Deploy the Express backend to your preferred Node host such as Cloud Run, Render, Railway, Fly.io, or Firebase Functions. Set the same backend environment variables from `backend/.env.example`, then set `VITE_API_URL` to the deployed API URL before building the frontend.

## Production Notes

- Replace the placeholder static sitemap with a generated sitemap once the production domain and Firestore posts are live.
- Configure SMTP/email provider values in the admin settings if you add transactional email.
- Add Firebase Cloud Messaging server credentials if you want push notifications in addition to the existing realtime Firestore notification feed.
- For high-traffic search, mirror post metadata into Algolia, Meilisearch, Typesense, or Firestore vector/search indexes.
