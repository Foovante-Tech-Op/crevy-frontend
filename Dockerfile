# syntax=docker/dockerfile:1

# The Node major lives in .nvmrc so there is one place to change it. CI reads
# the same file and passes it back as this build arg.
ARG NODE_VERSION=24

# =============================
# Builder
# =============================
FROM node:${NODE_VERSION}-alpine AS builder

WORKDIR /app

# Install corepack rather than relying on the base image to carry it. Node
# unbundled corepack in v25, and a bump past 24 would otherwise fail here with
# "/bin/sh: corepack: not found" (exit 127). The prompt toggle matters because
# the fetch happens on a non-TTY runner, where corepack would otherwise block
# asking to confirm the download.
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN npm install -g corepack@latest && corepack enable

# pnpm-workspace.yaml is NOT optional. pnpm records its settings in the
# lockfile, and installing without it aborts with
#   ERR_PNPM_LOCKFILE_CONFIG_MISMATCH
# even though the lockfile itself is correct. `COPY . .` further down brings it
# in far too late — the install has already run.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN --mount=type=cache,target=/root/.pnpm-store \
    pnpm install --frozen-lockfile

COPY . .

# NEXT_PUBLIC_API_URL is consumed at BUILD time, not just at runtime:
# next.config.ts bakes it into the rewrite destinations for /api/auth/*,
# /api/v1/* and /api/v2/*. Absent, those compile to "undefined/api/auth/:path*"
# and every proxied call 404s at runtime with nothing failing at build.
#
# In-cluster this should be the internal Service, not the public hostname —
# see k8s/configmap.yaml.
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# Every other NEXT_PUBLIC_* the app reads. These are inlined by the compiler,
# not read from the environment at runtime, so putting them in the ConfigMap
# does nothing — they have to be here, as build args, or they are permanently
# `undefined` in the shipped image.
#
# None of them fails the build when absent. Each fails quietly in production:
#
#   NEXT_PUBLIC_SITE_URL / _APP_URL   getServerSession (src/lib/auth-server.ts)
#       has no absolute URL to fetch, logs "No site URL env var found" and
#       returns null — every server-rendered page decides you are logged out.
#   NEXT_PUBLIC_MAPBOX_TOKEN          src/lib/map-style.ts falls back to "" and
#       SpatialCoordinatePicker renders "Map unavailable" — the project
#       registration wizard and the field-agent flow both lose their map.
#   NEXT_PUBLIC_STORAGE_URL           StorageService.resolveUrl builds every
#       uploaded-media URL against an empty base, so they come out as "/key"
#       and 404 against the frontend itself.
#   NEXT_PUBLIC_STORAGE_UPLOAD_ORIGIN dropped from the CSP connect-src, so the
#       browser blocks the direct PUT to the bucket. Uploads fail with a CSP
#       violation and no HTTP status to look up.
#   NEXT_PUBLIC_CLOUDINARY_URL        getOptimizedVideoUrl returns "" and the
#       landing-page hero/section videos render as empty <video> elements.
#
# NEXT_PUBLIC_API_VERSION is deliberately omitted: axiosClient defaults it to
# "v2", which is the version the backend serves.
ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
ARG NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
ARG NEXT_PUBLIC_MAPBOX_TOKEN
ENV NEXT_PUBLIC_MAPBOX_TOKEN=${NEXT_PUBLIC_MAPBOX_TOKEN}
ARG NEXT_PUBLIC_STORAGE_URL
ENV NEXT_PUBLIC_STORAGE_URL=${NEXT_PUBLIC_STORAGE_URL}
ARG NEXT_PUBLIC_STORAGE_UPLOAD_ORIGIN
ENV NEXT_PUBLIC_STORAGE_UPLOAD_ORIGIN=${NEXT_PUBLIC_STORAGE_UPLOAD_ORIGIN}
ARG NEXT_PUBLIC_CLOUDINARY_URL
ENV NEXT_PUBLIC_CLOUDINARY_URL=${NEXT_PUBLIC_CLOUDINARY_URL}

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN pnpm run build

# =============================
# Runner
# =============================
FROM node:${NODE_VERSION}-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Patch the Alpine layer before anything else.
#
# `node:24-alpine` is rebuilt when the Node maintainers cut an image, not when
# Alpine publishes a security update. So the base regularly ships an OS package
# whose fix is already sitting in the Alpine repository, and the
# `Trivy image scan (gate on CRITICAL/HIGH)` step goes red on it through no
# fault of anything in this repo.
#
# That is what blocked this deploy: CVE-2026-14456 (HIGH, OpenSSL denial of
# service via unbounded memory growth in the QUIC server) against
# libcrypto3/libssl3 at 3.5.7-r0, with 3.5.8-r0 already published in
# alpine v3.24 main. Trivy reported it status=fixed — the remedy existed and
# we were not taking it.
#
# Worth understanding what that failure looks like from the outside, because
# it is quiet: the gate sits BEFORE `Log in to GHCR` / `Push image`, and the
# deploy job is gated on `needs.build.result == 'success'`. So a red gate
# means the image is never pushed and the deploy never runs — the cluster
# just carries on serving the previous image. Nothing alerts, nothing rolls
# back, and `kubectl get deploy` shows a perfectly healthy Deployment on a
# stale tag. Comparing the running image against the commit SHA is the only
# way to notice.
#
# One `apk upgrade` takes the fix, and keeps taking it for the next such CVE
# without anyone editing this file. Deliberately NOT solved with
# `ignore-unfixed: true` or a .trivyignore: this finding is actionable, and
# suppressing actionable findings is how a gate stops meaning anything. Same
# principle as the npm removal below — fix the image, don't silence the
# scanner. crevy-backend's Dockerfile carries the identical block; both
# images share this base, so a base CVE will always hit them together.
#
# --no-cache leaves no apk index behind in the layer.
RUN apk --no-cache upgrade

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 --ingroup nodejs --shell /sbin/nologin nextjs

# Drop the bundled package managers from the RUNTIME image. Every Node image
# ships npm, and every CRITICAL/HIGH the image scan finds lives in npm's own
# dependencies (tar, brace-expansion, ip-address, undici) rather than in
# anything this container executes. The entrypoint is `node server.js` and
# nothing else. Globs and -f keep this a no-op if a future base moves them.
RUN rm -rf /usr/local/lib/node_modules/npm \
           /usr/local/lib/node_modules/corepack \
           /opt/yarn-* \
    && rm -f /usr/local/bin/npm \
             /usr/local/bin/npx \
             /usr/local/bin/corepack \
             /usr/local/bin/yarn \
             /usr/local/bin/yarnpkg

# `output: "standalone"` in next.config.ts emits a self-contained server with
# only the modules actually reachable, which is the difference between a
# ~200 MB image and a ~1.5 GB one. It does NOT include these two, which have to
# be copied alongside it — miss them and the app boots and serves every page
# without CSS, JS or images, which looks like a broken build rather than a
# missing COPY.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

EXPOSE 3000
ENV PORT=3000
# The standalone server binds localhost by default, which is unreachable from
# outside the container — the pod would fail its readiness probe while looking
# healthy in the logs.
ENV HOSTNAME=0.0.0.0

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD wget --spider --tries=1 --no-verbose http://127.0.0.1:${PORT}/ || exit 1

CMD ["node", "server.js"]
