# Crevy PWA — Field Agent Offline Guide

### Progressive Web App Implementation for Remote Area Operations

> **Why this matters:** Field agents deploying in rural Ghana, Volta Basin, and other low-connectivity regions need to onboard project owners and capture GPS + document data without internet access. This guide transforms the existing Next.js 16 App Router application into a fully offline-capable PWA, implementing local-first data storage, a submission queue, background sync, and installability on Android and iOS.

---

## Table of Contents

1. [What Gets Offline Support](#1-what-gets-offline-support)
2. [Architecture Overview](#2-architecture-overview)
3. [Package Installation](#3-package-installation)
4. [Web App Manifest](#4-web-app-manifest)
5. [Service Worker with Serwist](#5-service-worker-with-serwist)
6. [next.config.ts changes](#6-nextconfigts-changes)
7. [Root layout changes](#7-root-layout-changes)
8. [IndexedDB — Offline Storage Layer](#8-indexeddb--offline-storage-layer)
9. [Submission Queue](#9-submission-queue)
10. [React Hooks](#10-react-hooks)
11. [Form Auto-Save (Draft System)](#11-form-auto-save-draft-system)
12. [Online/Offline Banner Component](#12-onlineoffline-banner-component)
13. [Document (Photo) Capture Offline](#13-document-photo-capture-offline)
14. [Updating Existing Pages](#14-updating-existing-pages)
15. [App Icons Required](#15-app-icons-required)
16. [Testing Offline Behaviour](#16-testing-offline-behaviour)
17. [Deployment Checklist](#17-deployment-checklist)

---

## 1. What Gets Offline Support

| Feature                         | Offline capability                               | Storage              |
| ------------------------------- | ------------------------------------------------ | -------------------- |
| Project owner registration form | ✅ Full — save draft, queue submit               | IndexedDB            |
| New project form (3 steps)      | ✅ Full — auto-save draft every 30s              | IndexedDB            |
| Document / photo capture        | ✅ Full — store as base64, queue upload          | IndexedDB            |
| GPS coordinate capture          | ✅ Full — Web Geolocation API works offline      | In-memory / form     |
| Dashboard (read)                | ✅ Stale data shown when offline                 | Service Worker cache |
| Project owner list              | ✅ Last fetched data shown when offline          | Service Worker cache |
| Auth (login)                    | ❌ Requires network — redirect to offline notice | —                    |
| Credit purchases                | ❌ Requires network — financial transactions     | —                    |
| Real-time MRV data              | ❌ Requires network                              | —                    |

---

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│  FIELD AGENT DEVICE (Android / iOS)                             │
│                                                                 │
│  ┌──────────────┐    ┌─────────────────────────────────────┐   │
│  │  React App   │───►│  Service Worker (Serwist)           │   │
│  │  (Next.js)   │    │  ├─ Cache First (shell + assets)   │   │
│  │              │    │  ├─ Network First + offline page    │   │
│  │  ┌─────────┐ │    │  └─ Background Sync (API queue)    │   │
│  │  │ idb     │ │    └─────────────────────────────────────┘   │
│  │  │ Store   │ │              │ when online                    │
│  │  │         │ │              ▼                                │
│  │  │ drafts  │ │    ┌─────────────────────────────────────┐   │
│  │  │ queue   │ │    │  Crevy Backend API (/api/v2)        │   │
│  │  │ cache   │ │    └─────────────────────────────────────┘   │
│  │  └─────────┘ │                                              │
│  └──────────────┘                                              │
└─────────────────────────────────────────────────────────────────┘
```

**Three data flows:**

1. **Online:** Normal API call → success → done.
2. **Offline, form submit:** Form data saved to IndexedDB `submission-queue` → service worker registers a Background Sync → app shows "Saved. Will sync when connected."
3. **Connectivity restored:** Service worker fires `sync` event → drains `submission-queue` → calls real API → removes items from queue.

---

## 3. Package Installation

```bash
# PWA / Service Worker
pnpm add @serwist/next serwist

# IndexedDB wrapper (typed, Promise-based)
pnpm add idb

# Offline-first type definitions
pnpm add -D @types/serviceworker
```

**Why Serwist instead of `next-pwa`?**
`next-pwa` has not been updated for Next.js 14+ App Router. Serwist is the actively maintained fork, built by the same author, with first-class App Router support.

---

## 4. Web App Manifest

Create `public/manifest.json`:

```json
{
  "name": "Crevy — Carbon Registry",
  "short_name": "Crevy",
  "description": "Field agent tool for registering green projects and project owners.",
  "start_url": "/dashboard",
  "scope": "/",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#131927",
  "theme_color": "#2cc295",
  "lang": "en",
  "categories": ["business", "productivity", "environment"],
  "icons": [
    {
      "src": "/icons/pwa/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/pwa/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/pwa/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/pwa/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/pwa/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/pwa/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/pwa/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/pwa/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "shortcuts": [
    {
      "name": "Register Project Owner",
      "short_name": "Onboard",
      "description": "Onboard a new project owner",
      "url": "/project-developers/register",
      "icons": [{ "src": "/icons/pwa/icon-96x96.png", "sizes": "96x96" }]
    },
    {
      "name": "Register Project",
      "short_name": "New Project",
      "description": "Register a new green project",
      "url": "/new-project",
      "icons": [{ "src": "/icons/pwa/icon-96x96.png", "sizes": "96x96" }]
    }
  ],
  "screenshots": [],
  "prefer_related_applications": false
}
```

---

## 5. Service Worker with Serwist

### 5.1 Create `src/app/sw.ts`

This is compiled by Serwist at build time into `public/sw.js`.

```typescript
// src/app/sw.ts
import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

// This TypeScript type tells serwist what __SW_MANIFEST is
declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: false,

  runtimeCaching: [
    // ── Shell & static assets: Cache First ─────────────────────────────
    // These are the Next.js compiled JS/CSS chunks.
    // Once cached they are served instantly from cache.
    {
      matcher: /^https:\/\/[^/]+\/_next\/static\/.*/i,
      handler: "CacheFirst",
      options: {
        cacheName: "static-assets",
        expiration: { maxEntries: 200, maxAgeSeconds: 30 * 24 * 60 * 60 }, // 30 days
      },
    },

    // ── Next.js images: Cache First ────────────────────────────────────
    {
      matcher: /^https:\/\/[^/]+\/_next\/image.*/i,
      handler: "CacheFirst",
      options: {
        cacheName: "next-images",
        expiration: { maxEntries: 50, maxAgeSeconds: 7 * 24 * 60 * 60 }, // 7 days
      },
    },

    // ── Google Fonts: Stale While Revalidate ───────────────────────────
    {
      matcher: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "google-fonts",
        expiration: { maxEntries: 10, maxAgeSeconds: 365 * 24 * 60 * 60 },
      },
    },

    // ── API reads: Network First → offline fallback ────────────────────
    // GET API calls return stale cached data when offline.
    // POST/PATCH/DELETE are handled by the submission queue in IndexedDB —
    // do NOT cache them here (they go through the app layer, not SW).
    {
      matcher: ({ request, url }) =>
        request.method === "GET" &&
        (url.pathname.startsWith("/api/v2/project-developers") ||
          url.pathname.startsWith("/api/v2/projects") ||
          url.pathname.startsWith("/api/v2/partners") ||
          url.pathname.startsWith("/api/v2/auth/currencies")),
      handler: "NetworkFirst",
      options: {
        cacheName: "api-reads",
        networkTimeoutSeconds: 5,
        expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 }, // 1 hour
        cacheableResponse: { statuses: [0, 200] },
      },
    },

    // ── Dashboard pages: Network First → serve cached HTML ────────────
    // This lets field agents open /dashboard, /project-developers, /new-project
    // while offline and see their last-viewed state.
    {
      matcher: ({ request }) => request.mode === "navigate",
      handler: "NetworkFirst",
      options: {
        cacheName: "pages",
        networkTimeoutSeconds: 5,
        expiration: { maxEntries: 20, maxAgeSeconds: 24 * 60 * 60 }, // 24 hours
      },
    },

    // ── Cloudinary / remote images: Stale While Revalidate ────────────
    {
      matcher: /^https:\/\/res\.cloudinary\.com\/.*/i,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "cloudinary",
        expiration: { maxEntries: 30, maxAgeSeconds: 7 * 24 * 60 * 60 },
      },
    },

    // ── Default fallback ──────────────────────────────────────────────
    ...defaultCache,
  ],
});

serwist.addEventListeners();

// ─── BACKGROUND SYNC ──────────────────────────────────────────────────────
// When the device comes back online after submitting a form offline,
// the browser fires a 'sync' event. We drain the IndexedDB queue here.
//
// NOTE: Background Sync API requires HTTPS. It is available on Chrome/Android.
// On iOS Safari (15.4+) it uses periodic background sync instead.
// For browsers without Background Sync support, the app-layer drain
// (useSubmissionQueue hook) acts as the fallback.

self.addEventListener("sync", (event: any) => {
  if (event.tag === "crevy-sync-queue") {
    event.waitUntil(drainQueue());
  }
});

async function drainQueue() {
  // Open the IDB queue and re-attempt each submission.
  // Full implementation is in src/lib/offline/sync.ts (browser context).
  // In the service worker we send a message to the active client(s)
  // to trigger the drain — this keeps the API logic in the app layer
  // where it has access to auth cookies.
  const clients = await self.clients.matchAll({ type: "window" });
  for (const client of clients) {
    client.postMessage({ type: "DRAIN_QUEUE" });
  }
}
```

---

## 6. `next.config.ts` Changes

```typescript
// next.config.ts
import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  // Location of our SW source file (relative to project root)
  swSrc: "src/app/sw.ts",

  // Output location (must be in /public so it's served at origin root)
  swDest: "public/sw.js",

  // Disable SW in development — hot reload and SW caching conflict
  disable: process.env.NODE_ENV === "development",

  // Do not use the next-specific worker entry — we write our own sw.ts
  // reloadOnOnline: true, // auto-reload page when device reconnects
});

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      { protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" },
      { protocol: "https", hostname: "images.pexels.com", pathname: "/**" },
    ],
  },

  async headers() {
    return [
      {
        // Service worker must be served with this header so it can
        // claim all pages on the origin, not just /sw.js
        source: "/sw.js",
        headers: [
          { key: "Service-Worker-Allowed", value: "/" },
          { key: "Cache-Control", value: "no-cache" },
        ],
      },
    ];
  },

  async rewrites() {
    return [
      {
        source: "/api/auth/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL}/api/auth/:path*`,
      },
      {
        source: "/api/v1/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL}/api/v1/:path*`,
      },
      {
        source: "/api/v2/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL}/api/v2/:path*`,
      },
    ];
  },
};

export default withSerwist(nextConfig);
```

---

## 7. Root Layout Changes

Add manifest link, theme-color meta, apple touch icon, and the service worker registration script to `src/app/layout.tsx`:

```typescript
// src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Syne } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import QueryProvider from "@/components/providers/query-provider";
import SmoothScroll from "@/components/providers/SmoothScroll";
import OfflineBanner from "@/components/offline/OfflineBanner";
import SyncListener from "@/components/offline/SyncListener";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const syne = Syne({
  variable: "--font-syne",
  subsets:  ["latin"],
  weight:   ["400", "500", "600", "700", "800"],
});

// Viewport config — controls mobile browser chrome colour
export const viewport: Viewport = {
  themeColor:        "#2cc295",
  width:             "device-width",
  initialScale:      1,
  maximumScale:      1,
  userScalable:      false,
};

export const metadata: Metadata = {
  title:       "Crevy — Carbon Registry",
  description: "Green project management and carbon credit marketplace for Africa and beyond.",
  manifest:    "/manifest.json",
  appleWebApp: {
    capable:           true,
    statusBarStyle:    "black-translucent",
    title:             "Crevy",
    startupImage:      "/icons/pwa/icon-512x512.png",
  },
  icons: {
    icon:  [
      { url: "/icons/pwa/icon-32x32.png",  sizes: "32x32",  type: "image/png" },
      { url: "/icons/pwa/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/icons/pwa/icon-180x180.png",
  },
  other: {
    // Android / Chrome installability
    "mobile-web-app-capable": "yes",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} ${syne.variable} antialiased`}>
        <QueryProvider>
          <SmoothScroll>
            {/* Global offline status banner — only visible when offline */}
            <OfflineBanner />
            {/* Listens for DRAIN_QUEUE messages from the service worker */}
            <SyncListener />
            {children}
          </SmoothScroll>
        </QueryProvider>
        <Toaster position="top-right" />

        {/* Service worker registration — runs only in browser */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker
                    .register('/sw.js', { scope: '/' })
                    .then(function(reg) {
                      console.log('[Crevy SW] Registered, scope:', reg.scope);
                    })
                    .catch(function(err) {
                      console.warn('[Crevy SW] Registration failed:', err);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
```

---

## 8. IndexedDB — Offline Storage Layer

Create `src/lib/offline/db.ts`:

```typescript
// src/lib/offline/db.ts
//
// Single IndexedDB database for all offline Crevy data.
// Uses the `idb` package for Promise-based, typed access.
//
// Stores:
//   drafts          — in-progress form data (auto-saved every 30s)
//   submission-queue — API calls queued while offline
//   offline-cache   — project owner / project records read while online

import { openDB, type DBSchema, type IDBPDatabase } from "idb";

// ─── Schema ───────────────────────────────────────────────────────────────────

export interface DraftRecord {
  id: string; // e.g. "project-owner-draft" | "project-draft-{tempId}"
  type: "project-owner" | "project";
  step: number; // which step the user was on
  data: unknown; // the raw form values (TUserRegistrationInput | TCreateProject)
  savedAt: number; // Date.now()
  // Document blobs stored separately in document-queue
}

export interface QueuedSubmission {
  id: string; // uuidv4 generated client-side
  type: "create-project-owner" | "create-project" | "upload-document";
  url: string; // e.g. "/api/v2/project-developers/onboard"
  method: "POST" | "PUT" | "PATCH";
  body: unknown; // serialisable payload (no File objects — use documentId)
  headers?: Record<string, string>;
  queuedAt: number; // Date.now()
  attempts: number; // sync retry count
  lastAttempt: number | null; // Date.now() of last attempt
  error: string | null; // last error message
}

export interface QueuedDocument {
  id: string; // matches body.documentId in a QueuedSubmission
  projectTempId: string; // links to the draft project
  documentType: string; // land_ownership | community_consent | etc.
  fileName: string;
  mimeType: string;
  base64: string; // base64-encoded file content
  fileSize: number;
  queuedAt: number;
}

export interface OfflineCacheRecord {
  id: string;
  type: "project-owner-list" | "project-list" | "currencies";
  data: unknown;
  cachedAt: number;
}

interface CrevyDB extends DBSchema {
  drafts: {
    key: string;
    value: DraftRecord;
    indexes: { "by-type": string };
  };
  "submission-queue": {
    key: string;
    value: QueuedSubmission;
    indexes: { "by-type": string; "by-queued-at": number };
  };
  "document-queue": {
    key: string;
    value: QueuedDocument;
    indexes: { "by-project": string };
  };
  "offline-cache": {
    key: string;
    value: OfflineCacheRecord;
    indexes: { "by-type": string };
  };
}

// ─── Database singleton ───────────────────────────────────────────────────────

let _db: IDBPDatabase<CrevyDB> | null = null;

export async function getDB(): Promise<IDBPDatabase<CrevyDB>> {
  if (_db) return _db;

  _db = await openDB<CrevyDB>("crevy-offline", 1, {
    upgrade(db) {
      // Drafts store
      const draftsStore = db.createObjectStore("drafts", { keyPath: "id" });
      draftsStore.createIndex("by-type", "type");

      // Submission queue store
      const queueStore = db.createObjectStore("submission-queue", {
        keyPath: "id",
      });
      queueStore.createIndex("by-type", "type");
      queueStore.createIndex("by-queued-at", "queuedAt");

      // Document (file) queue
      const docStore = db.createObjectStore("document-queue", {
        keyPath: "id",
      });
      docStore.createIndex("by-project", "projectTempId");

      // Offline cache
      const cacheStore = db.createObjectStore("offline-cache", {
        keyPath: "id",
      });
      cacheStore.createIndex("by-type", "type");
    },
  });

  return _db;
}

// ─── Draft helpers ────────────────────────────────────────────────────────────

export async function saveDraft(draft: DraftRecord): Promise<void> {
  const db = await getDB();
  await db.put("drafts", { ...draft, savedAt: Date.now() });
}

export async function loadDraft(id: string): Promise<DraftRecord | undefined> {
  const db = await getDB();
  return db.get("drafts", id);
}

export async function deleteDraft(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("drafts", id);
}

export async function listDrafts(
  type: DraftRecord["type"],
): Promise<DraftRecord[]> {
  const db = await getDB();
  return db.getAllFromIndex("drafts", "by-type", type);
}

// ─── Submission queue helpers ─────────────────────────────────────────────────

export async function enqueueSubmission(
  item: Omit<QueuedSubmission, "attempts" | "lastAttempt" | "error">,
): Promise<void> {
  const db = await getDB();
  await db.put("submission-queue", {
    ...item,
    attempts: 0,
    lastAttempt: null,
    error: null,
  });
}

export async function listQueue(): Promise<QueuedSubmission[]> {
  const db = await getDB();
  return db.getAllFromIndex("submission-queue", "by-queued-at");
}

export async function updateQueueItem(
  id: string,
  updates: Partial<QueuedSubmission>,
): Promise<void> {
  const db = await getDB();
  const existing = await db.get("submission-queue", id);
  if (existing) await db.put("submission-queue", { ...existing, ...updates });
}

export async function removeFromQueue(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("submission-queue", id);
}

// ─── Document queue helpers ───────────────────────────────────────────────────

export async function enqueueDocument(doc: QueuedDocument): Promise<void> {
  const db = await getDB();
  await db.put("document-queue", doc);
}

export async function getDocumentsByProject(
  projectTempId: string,
): Promise<QueuedDocument[]> {
  const db = await getDB();
  return db.getAllFromIndex("document-queue", "by-project", projectTempId);
}

export async function removeDocument(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("document-queue", id);
}

// ─── Offline cache helpers ────────────────────────────────────────────────────

export async function setCachedData(
  id: string,
  type: OfflineCacheRecord["type"],
  data: unknown,
): Promise<void> {
  const db = await getDB();
  await db.put("offline-cache", { id, type, data, cachedAt: Date.now() });
}

export async function getCachedData(
  id: string,
): Promise<OfflineCacheRecord | undefined> {
  const db = await getDB();
  return db.get("offline-cache", id);
}
```

---

## 9. Submission Queue

Create `src/lib/offline/sync.ts`:

```typescript
// src/lib/offline/sync.ts
//
// Drains the IndexedDB submission queue when the device is online.
// Called by:
//   1. SyncListener component when it receives DRAIN_QUEUE from SW
//   2. useSubmissionQueue hook on mount if navigator.onLine is true
//   3. window 'online' event listener

import {
  listQueue,
  updateQueueItem,
  removeFromQueue,
  getDocumentsByProject,
  removeDocument,
  type QueuedSubmission,
} from "./db";
import { axiosClient } from "@/lib/axiosClient";

const MAX_ATTEMPTS = 5;
const RETRY_DELAY_MS = [1_000, 5_000, 15_000, 60_000, 300_000]; // exponential

export async function drainSubmissionQueue(
  onProgress?: (
    item: QueuedSubmission,
    status: "success" | "failed" | "retrying",
  ) => void,
): Promise<{ succeeded: number; failed: number }> {
  const queue = await listQueue();
  let succeeded = 0;
  let failed = 0;

  for (const item of queue) {
    if (item.attempts >= MAX_ATTEMPTS) {
      failed++;
      onProgress?.(item, "failed");
      continue;
    }

    try {
      await axiosClient.request({
        url: item.url,
        method: item.method,
        data: item.body,
        headers: {
          "Content-Type": "application/json",
          "X-Offline-Sync": "true", // lets backend log these differently
          ...item.headers,
        },
      });

      // On success: remove from queue and delete linked documents
      await removeFromQueue(item.id);
      // If it was a project creation, also upload queued documents
      if (item.type === "create-project" && (item.body as any)?.tempId) {
        await uploadQueuedDocuments((item.body as any).tempId);
      }

      succeeded++;
      onProgress?.(item, "success");
    } catch (err: any) {
      // Network error (still offline) — keep item, increment attempts
      const isNetworkError = !err.response;
      const newAttempts = item.attempts + 1;

      await updateQueueItem(item.id, {
        attempts: newAttempts,
        lastAttempt: Date.now(),
        error: isNetworkError
          ? "Network unavailable"
          : (err.response?.data?.message ?? err.message),
      });

      if (isNetworkError) {
        // Device is still offline — abort the drain entirely
        break;
      }

      if (newAttempts >= MAX_ATTEMPTS) {
        failed++;
        onProgress?.(item, "failed");
      } else {
        onProgress?.(item, "retrying");
      }
    }
  }

  return { succeeded, failed };
}

async function uploadQueuedDocuments(projectTempId: string) {
  // After the real project is created we need the real project ID.
  // For now documents are re-queued with the real ID from the response.
  // This requires the create-project queue item to store the server-returned ID.
  // TODO: implement after backend create-project returns { data: { id } }
}

// ─── Register Background Sync ─────────────────────────────────────────────────
// Tells the service worker to fire a 'sync' event when connectivity returns.

export async function requestBackgroundSync(): Promise<void> {
  if (!("serviceWorker" in navigator) || !("SyncManager" in window)) {
    // Background Sync not supported (iOS <16.4, Firefox)
    // Fall back to draining on the 'online' event in the hook
    return;
  }
  try {
    const registration = await navigator.serviceWorker.ready;
    await (registration as any).sync.register("crevy-sync-queue");
  } catch {
    // SW not active yet — the online event fallback will handle it
  }
}
```

---

## 10. React Hooks

### `src/hooks/use-online-status.ts`

```typescript
// src/hooks/use-online-status.ts
"use client";

import { useEffect, useState } from "react";
import {
  drainSubmissionQueue,
  requestBackgroundSync,
} from "@/lib/offline/sync";

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true,
  );

  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      // Immediately try to drain the queue when we reconnect
      await drainSubmissionQueue();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}
```

### `src/hooks/use-draft.ts`

```typescript
// src/hooks/use-draft.ts
"use client";

import { useCallback, useEffect, useRef } from "react";
import { saveDraft, loadDraft, deleteDraft } from "@/lib/offline/db";
import type { DraftRecord } from "@/lib/offline/db";

interface UseDraftOptions {
  id: string;
  type: DraftRecord["type"];
  /** How often to auto-save in milliseconds. Default: 30000 */
  interval?: number;
}

export function useDraft<T>(options: UseDraftOptions, getValue: () => T) {
  const { id, type, interval = 30_000 } = options;
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-save on interval
  useEffect(() => {
    intervalRef.current = setInterval(async () => {
      const data = getValue();
      await saveDraft({ id, type, step: 0, data, savedAt: Date.now() });
    }, interval);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [id, type, interval, getValue]);

  const save = useCallback(
    async (step: number, data: T) => {
      await saveDraft({ id, type, step, data, savedAt: Date.now() });
    },
    [id, type],
  );

  const load = useCallback(async (): Promise<DraftRecord | undefined> => {
    return loadDraft(id);
  }, [id]);

  const clear = useCallback(async () => {
    await deleteDraft(id);
  }, [id]);

  return { save, load, clear };
}
```

### `src/hooks/use-submission-queue.ts`

```typescript
// src/hooks/use-submission-queue.ts
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  listQueue,
  enqueueSubmission,
  type QueuedSubmission,
} from "@/lib/offline/db";
import {
  drainSubmissionQueue,
  requestBackgroundSync,
} from "@/lib/offline/sync";
import { useOnlineStatus } from "./use-online-status";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

export function useSubmissionQueue() {
  const isOnline = useOnlineStatus();
  const [queue, setQueue] = useState<QueuedSubmission[]>([]);
  const [syncing, setSyncing] = useState(false);

  const refreshQueue = useCallback(async () => {
    const items = await listQueue();
    setQueue(items);
  }, []);

  useEffect(() => {
    refreshQueue();
  }, [refreshQueue]);

  // When online, auto-drain
  useEffect(() => {
    if (isOnline && queue.length > 0) {
      setSyncing(true);
      drainSubmissionQueue((item, status) => {
        if (status === "success") {
          toast.success(`Synced: ${item.type.replace(/-/g, " ")}`);
        }
      })
        .then(({ succeeded, failed }) => {
          if (succeeded > 0)
            toast.success(`${succeeded} item(s) synced successfully.`);
          if (failed > 0)
            toast.error(
              `${failed} item(s) could not be synced. They will retry automatically.`,
            );
        })
        .finally(() => {
          setSyncing(false);
          refreshQueue();
        });
    }
  }, [isOnline]);

  /**
   * Submit a request. If online, calls the API directly.
   * If offline, saves to the queue and registers a background sync.
   */
  const submit = useCallback(
    async (
      type: QueuedSubmission["type"],
      url: string,
      method: QueuedSubmission["method"],
      body: unknown,
    ): Promise<{ success: boolean; queued: boolean; data?: unknown }> => {
      if (isOnline) {
        // Try directly
        const { axiosClient } = await import("@/lib/axiosClient");
        const response = await axiosClient.request({ url, method, data: body });
        return { success: true, queued: false, data: response.data };
      }

      // Offline — add to queue
      const id = uuidv4();
      await enqueueSubmission({
        id,
        type,
        url,
        method,
        body,
        queuedAt: Date.now(),
      });
      await requestBackgroundSync();
      await refreshQueue();

      toast.info("Saved offline. Will sync automatically when you reconnect.", {
        duration: 6000,
        icon: "📡",
      });

      return { success: true, queued: true };
    },
    [isOnline, refreshQueue],
  );

  return { queue, syncing, submit, refreshQueue };
}
```

---

## 11. Form Auto-Save (Draft System)

### How to add auto-save to the project owner registration form

In `src/app/(dashboard)/project-developers/register/page.tsx` (or wherever the onboarding form lives), add:

```typescript
"use client";
import { useDraft } from "@/hooks/use-draft";
import { useSubmissionQueue } from "@/hooks/use-submission-queue";

export default function RegisterProjectOwnerPage() {
  const form = useForm<TProjectOwnerOnboarding>({ ... });

  // Auto-saves form values to IndexedDB every 30 seconds
  const { save, load, clear } = useDraft(
    { id: "project-owner-draft", type: "project-owner" },
    () => form.getValues(),
  );

  // Restore draft on mount
  useEffect(() => {
    load().then((draft) => {
      if (draft?.data) {
        form.reset(draft.data as any);
        toast.info("Draft restored — you left this form unfinished.", {
          action: { label: "Clear", onClick: clear },
        });
      }
    });
  }, []);

  const { submit } = useSubmissionQueue();

  const onSubmit = async (data: TProjectOwnerOnboarding) => {
    const result = await submit(
      "create-project-owner",
      "/api/v2/project-developers/onboard",
      "POST",
      data,
    );

    if (result.success && !result.queued) {
      await clear();          // delete draft on successful sync
      router.push("/project-developers");
    }
    // If queued, we do NOT clear the draft — it acts as a record of what was submitted
  };
}
```

### How to add auto-save to the new-project form

In `src/app/(project)/new-project/page.tsx`, add the same pattern with `id: "project-draft"`.

Additionally, save the current step so the form can resume on the correct step:

```typescript
const { save, load, clear } = useDraft(
  { id: "project-draft", type: "project" },
  () => methods.getValues(),
);

// When step changes, save with step number
useEffect(() => {
  save(currentStep, methods.getValues());
}, [currentStep]);
```

---

## 12. Online/Offline Banner Component

Create `src/components/offline/OfflineBanner.tsx`:

```typescript
// src/components/offline/OfflineBanner.tsx
"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CloudOff, RefreshCw, Wifi } from "lucide-react";
import { useEffect, useState } from "react";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { listQueue } from "@/lib/offline/db";

export default function OfflineBanner() {
  const isOnline = useOnlineStatus();
  const [queueCount, setQueueCount] = useState(0);
  const [justCameOnline, setJustCameOnline] = useState(false);

  useEffect(() => {
    listQueue().then((q) => setQueueCount(q.length));
  }, [isOnline]);

  useEffect(() => {
    if (isOnline && queueCount > 0) {
      setJustCameOnline(true);
      const t = setTimeout(() => setJustCameOnline(false), 4000);
      return () => clearTimeout(t);
    }
  }, [isOnline, queueCount]);

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          key="offline"
          initial={{ y: -48, opacity: 0 }}
          animate={{ y: 0,   opacity: 1 }}
          exit={{    y: -48, opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="fixed top-0 inset-x-0 z-[9999] flex items-center justify-center gap-3
                     bg-slate-800 text-white text-sm font-semibold py-3 px-4 shadow-lg"
        >
          <CloudOff className="h-4 w-4 text-amber-400 shrink-0" />
          <span>
            You&apos;re offline. Forms will be saved and synced when you reconnect.
            {queueCount > 0 && (
              <span className="ml-2 bg-amber-400 text-slate-900 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {queueCount} pending
              </span>
            )}
          </span>
        </motion.div>
      )}

      {isOnline && justCameOnline && (
        <motion.div
          key="syncing"
          initial={{ y: -48, opacity: 0 }}
          animate={{ y: 0,   opacity: 1 }}
          exit={{    y: -48, opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="fixed top-0 inset-x-0 z-[9999] flex items-center justify-center gap-3
                     bg-[#2cc295] text-white text-sm font-semibold py-3 px-4 shadow-lg"
        >
          <Wifi className="h-4 w-4 shrink-0" />
          <span>Back online — syncing {queueCount} saved item(s)…</span>
          <RefreshCw className="h-4 w-4 animate-spin shrink-0" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

Create `src/components/offline/SyncListener.tsx`:

```typescript
// src/components/offline/SyncListener.tsx
// Listens for DRAIN_QUEUE messages from the service worker
// (fired when the SW receives a Background Sync event).
"use client";

import { useEffect } from "react";
import { drainSubmissionQueue } from "@/lib/offline/sync";

export default function SyncListener() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "DRAIN_QUEUE") {
        drainSubmissionQueue();
      }
    };

    navigator.serviceWorker.addEventListener("message", handleMessage);
    return () => {
      navigator.serviceWorker.removeEventListener("message", handleMessage);
    };
  }, []);

  return null;
}
```

---

## 13. Document (Photo) Capture Offline

When a field agent uploads a document or takes a photo in `Step3_Documents.tsx` while offline, the file must be stored as base64 in IndexedDB rather than uploaded immediately.

Add this utility to `src/lib/offline/documents.ts`:

```typescript
// src/lib/offline/documents.ts
import { enqueueDocument, type QueuedDocument } from "./db";

/** Convert a File to base64 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/** Save a document file to the offline queue */
export async function saveDocumentOffline(
  file: File,
  documentType: string,
  projectTempId: string,
): Promise<string> {
  const base64 = await fileToBase64(file);
  const id = `doc-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  await enqueueDocument({
    id,
    projectTempId,
    documentType,
    fileName: file.name,
    mimeType: file.type,
    fileSize: file.size,
    base64,
    queuedAt: Date.now(),
  });

  return id; // returned so it can be stored in form state
}
```

In `Step3_Documents.tsx`, modify the `handleFileChange` function:

```typescript
import { saveDocumentOffline } from "@/lib/offline/documents";

const handleFileChange = async (docTypeId, e, multiple) => {
  const files = Array.from(e.target.files ?? []);
  if (files.length === 0) return;

  const isOnline = navigator.onLine;

  if (!isOnline) {
    // Save to IndexedDB for later upload
    const projectTempId = methods.getValues("tempId") ?? "draft";
    for (const file of files) {
      await saveDocumentOffline(file, docTypeId, projectTempId);
    }
    toast.info("Document saved offline. Will upload when connected.");
    // Update form state with a local reference
    setValue("documents", {
      ...documents,
      [docTypeId]: multiple ? files : files[0],
    });
  } else {
    // Normal online path — set in form state and upload on submit
    setValue("documents", {
      ...documents,
      [docTypeId]: multiple ? files : files[0],
    });
  }
};
```

---

## 14. Updating Existing Pages

### Pages that need the `useSubmissionQueue` hook instead of direct API calls

| Page                                   | Current API call                     | Change needed                                        |
| -------------------------------------- | ------------------------------------ | ---------------------------------------------------- |
| `project-developers/register/page.tsx` | `UserService.registerUser(data)`     | Replace with `submit("create-project-owner", ...)`   |
| `new-project/page.tsx`                 | `ProjectService.createProject(data)` | Replace with `submit("create-project", ...)`         |
| `new-project/page.tsx`                 | `ProjectService.uploadDocument(...)` | Replace with `saveDocumentOffline(...)` when offline |

### Pages that benefit from the `useDraft` hook

| Page                                   | Draft ID                | Form type                 |
| -------------------------------------- | ----------------------- | ------------------------- |
| `project-developers/register/page.tsx` | `"project-owner-draft"` | `TProjectOwnerOnboarding` |
| `new-project/page.tsx`                 | `"project-draft"`       | `TCreateProject`          |

---

## 15. App Icons Required

Generate these icon sizes from `public/icons/Crevy.png` (the existing logo). Use a tool like **PWA Asset Generator** (`npx pwa-asset-generator`) or [https://realfavicongenerator.net](https://realfavicongenerator.net):

```
public/icons/pwa/
  icon-32x32.png
  icon-72x72.png
  icon-96x96.png
  icon-128x128.png
  icon-144x144.png
  icon-152x152.png
  icon-180x180.png     ← Apple Touch Icon
  icon-192x192.png     ← Android home screen
  icon-384x384.png
  icon-512x512.png     ← Splash screen / install prompt
```

The `192` and `512` icons must have `"purpose": "maskable"` in the manifest — this means the icon must have safe-zone padding (at least 10% inset from all edges). Use [https://maskable.app](https://maskable.app) to check.

Generate with one command:

```bash
npx pwa-asset-generator public/icons/Crevy.png public/icons/pwa \
  --background "#131927" \
  --padding "15%" \
  --manifest public/manifest.json \
  --index src/app/layout.tsx
```

---

## 16. Testing Offline Behaviour

### In Chrome DevTools

1. Open DevTools → **Application** tab → **Service Workers**
2. Tick **"Offline"** checkbox to simulate no network
3. Navigate to `/project-developers/register` — the page should load from cache
4. Fill out and submit the form — should show "Saved offline" toast
5. Untick **"Offline"** — should see "Back online — syncing…" banner
6. Open **Application → IndexedDB → crevy-offline** to inspect stored data

### Lighthouse PWA Audit

```bash
# Build and serve production build
pnpm build && pnpm start

# In Chrome: DevTools → Lighthouse → select "Progressive Web App" → Analyze
# Target score: 100/100 on all PWA criteria
```

Key Lighthouse PWA checks:

- ✅ Installable (manifest + SW registered)
- ✅ PWA Optimised (HTTPS, viewport, theme-color)
- ✅ Offline page served (SW returns cached HTML when offline)

### Manual install test

**Android (Chrome):**

- Visit the app → Chrome shows "Add to Home screen" banner
- Or: Chrome menu → "Install app"

**iOS (Safari):**

- Visit the app → Share → "Add to Home Screen"
- Note: iOS does not support Background Sync — the app-layer drain on `online` event is the fallback

---

## 17. Deployment Checklist

```
[ ] pnpm add @serwist/next serwist idb
[ ] public/manifest.json created
[ ] public/icons/pwa/ — all 10 icon sizes generated
[ ] src/app/sw.ts created
[ ] next.config.ts wrapped with withSerwist
[ ] src/app/layout.tsx — manifest link, viewport, SW registration script
[ ] src/lib/offline/db.ts created
[ ] src/lib/offline/sync.ts created
[ ] src/lib/offline/documents.ts created
[ ] src/hooks/use-online-status.ts created
[ ] src/hooks/use-draft.ts created
[ ] src/hooks/use-submission-queue.ts created
[ ] src/components/offline/OfflineBanner.tsx created
[ ] src/components/offline/SyncListener.tsx created
[ ] project-developers/register/page.tsx — useDraft + useSubmissionQueue wired
[ ] new-project/page.tsx — useDraft + useSubmissionQueue wired
[ ] Step3_Documents.tsx — offline document save wired
[ ] HTTPS configured on production (required for SW + Background Sync)
[ ] Lighthouse PWA audit: ≥90 score
[ ] Tested offline in Chrome DevTools
[ ] Tested install on Android Chrome
[ ] Tested install on iOS Safari (Add to Home Screen)
```

---

_Guide authored: June 2026 · Crevy Platform · Foovante Global_
_Target: Next.js 16 / React 19 / Serwist / idb_
