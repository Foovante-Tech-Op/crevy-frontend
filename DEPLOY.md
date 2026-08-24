# Deploying crevy-frontend

Companion to `crevy-backend/CLOUDFLARE_MIGRATION.md` (Phase 4 + Phase 5b) and
`crevy-backend/HANDOFF.md`. That pair explains *why*; this is the ordered list
of *what to do*, for this repo specifically.

Target: `https://crevy.foovanteglobal.earth`, self-hosted on the same k3s VPS
as the API (`169.58.154.18`, namespace `crevy`), behind Cloudflare's proxy on a
Cloudflare Origin CA certificate.

---

## Two blockers that are not in the handoff

Both will stop the first deploy dead. Deal with them in Phase A.

**1. The self-hosted runner is registered to the wrong repo.**
`k8s/install-github-runner.sh` in crevy-backend registers with
`--url https://github.com/Foovante-Tech-Op/crevy-backend`. A repo-scoped runner
serves only that repo. This repo's deploy job asks for
`runs-on: [self-hosted, crevy-vps]`, so it will sit **queued forever** — no
error, no timeout you would notice, just a job that never starts. Re-register
the runner at the **organization** level (A4).

**2. The deploy ServiceAccount cannot create a Deployment, only patch one.**
`crevy-deploy-role` grants `get, list, watch, patch, update` on
`apps/deployments` — no `create`. `kubectl apply` on an object that does not
exist yet is a CREATE, so the very first CI deploy fails with
`deployments.apps "crevy-frontend" is forbidden`. Either add `create` to the
Role (A5, recommended) or hand-apply the Deployment once (C3).

---

## Phase A — GitHub and SonarCloud (nothing in production changes)

### A1. SONAR_TOKEN as a repo secret

**Org-level secrets are not an option here.** On GitHub Free, organization
Actions secrets are usable only by **public** repositories; scoping one to
private repos — the "Private repositories" and "Selected repositories" access
options — requires GitHub Team or Enterprise Cloud. Both of these repos are
private, so the repository selector comes up empty and there is nothing to
pick. That is a plan limit, not a permissions problem: being an org owner does
not change it.

So: copy the token into this repo instead.

crevy-frontend → **Settings → Secrets and variables → Actions → Secrets →
New repository secret**.

| Name | Value |
|---|---|
| `SONAR_TOKEN` | the same value already in crevy-backend's repo secrets |

Read it out of your SonarCloud account (**My Account → Security**) rather than
trying to recover it from the backend repo — GitHub never shows a secret's
value again after it is saved. If the original is lost, generate a new token
there and update **both** repos.

It must be a **user** token, not a project-scoped one. A project-scoped token
can push an analysis but cannot read `/api/ce/task` back, which is what made
the backend's quality-gate step 403 earlier. One user token covers both
projects.

**This now lives in two places.** Rotating it means updating crevy-backend and
crevy-frontend, and there is no way to tell from either repo whether the other
is current. Note it wherever the other rotation duties live — see the "Still
open" section at the bottom of this file.

`NVD_API_KEY` and `SLACK_WEBHOOK_URL` stay exactly where they are; they are
backend-only and this pipeline does not reference them.

If the org ever moves to GitHub Team, collapsing all three into org secrets
scoped to both repos is worth doing — one place to rotate.

### A2. Create the SonarCloud project

1. SonarCloud → **Analyze new project** → `Foovante-Tech-Op/crevy-frontend`.
2. Confirm the generated project key is exactly `Foovante-Tech-Op_crevy-frontend`
   — that is what `sonar-project.properties` declares. A mismatch does not
   fail: SonarCloud auto-provisions a phantom project, analyzes that instead,
   and the quality-gate step 403s while the real project stays empty.
3. **Administration → Analysis Method → turn OFF Automatic Analysis.** It is
   mutually exclusive with CI analysis; leaving it on aborts the scanner with
   "You are running CI analysis while Automatic Analysis is enabled", which
   reads like a scanner bug rather than a project setting.

The Quality Gate step runs with `continue-on-error: true` on purpose — this
repo has no test suite, so Coverage on New Code is 0% and a blocking gate would
reject every commit.

### A3. Repo variables and secrets on crevy-frontend

Repo → **Settings → Secrets and variables → Actions**.

**Variables** tab — every one of these is inlined into the bundle at *compile*
time. A missing value never fails the build; it fails quietly at runtime.

| Variable | Value | What breaks if missing |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://crevy-backend-service.crevy.svc.cluster.local` | rewrites compile to `undefined/api/auth/:path*` → every proxied call 404s |
| `NEXT_PUBLIC_SITE_URL` | `https://crevy.foovanteglobal.earth` | `getServerSession` has no absolute URL → every SSR page renders logged-out |
| `NEXT_PUBLIC_APP_URL` | `https://crevy.foovanteglobal.earth` | same, plus `authClient`'s SSR baseURL |
| `NEXT_PUBLIC_STORAGE_URL` | `https://pub-0d241a39f8184fddabae6e38b091b3bc.r2.dev` | uploaded media URLs resolve to `/key` and 404 against the frontend; also drops out of the CSP `img-src` |
| `NEXT_PUBLIC_STORAGE_UPLOAD_ORIGIN` | `https://crevy-media.d52e692450b4c3464d4c636548654203.r2.cloudflarestorage.com` | CSP blocks the direct PUT → uploads fail with a CSP violation and no HTTP status |
| `NEXT_PUBLIC_CLOUDINARY_URL` | `https://res.cloudinary.com/daffqurhi/video/upload` | landing-page hero/section videos render as empty `<video>` |

`NEXT_PUBLIC_API_URL` is the **internal** Service on purpose.
`src/lib/axiosClient.tsx` returns `""` in the browser and reads this variable
only server-side, so SSR fetches and the rewrite proxy stay inside the cluster
— no round-trip out to Cloudflare and back to the same machine.

`NEXT_PUBLIC_API_VERSION` is deliberately absent: `axiosClient` defaults it to
`v2`, which is what the backend serves.

**Secrets** tab:

| Secret | Value |
|---|---|
| `NEXT_PUBLIC_MAPBOX_TOKEN` | the Mapbox public token |

It is in `secrets` only to stay masked in run logs. `NEXT_PUBLIC_` means it is
compiled into the client bundle and served to every visitor — it is public by
construction. **Restrict it by URL in the Mapbox dashboard**, not by hiding it
here.

### A4. Re-register the runner at the org level — BLOCKER

On the VPS, as `anwar`. **Do not use `sudo su - deploy` and paste a block into
it** — that opens an interactive shell and every following line races it, so
they execute in the wrong shell, in the wrong directory, or as the wrong user.
Each command below is self-contained; run them one at a time.

Two rules govern which user runs what:

- `svc.sh` manages a systemd unit, so it needs **root**.
- `config.sh` **refuses to run as root** ("Must not run with sudo"), so it runs
  as `deploy` via `sudo -u deploy`.

```bash
# 0. Confirm the layout and the current unit name before changing anything.
sudo ls /home/deploy/actions-runner | head
systemctl list-units --type=service | grep -i actions.runner
```

```bash
# 1. Stop and remove the systemd unit (root, from the runner directory).
sudo bash -c 'cd /home/deploy/actions-runner && ./svc.sh stop && ./svc.sh uninstall'
```

```bash
# 2. Deregister from crevy-backend (as deploy, NOT root).
# Removal token: crevy-backend → Settings → Actions → Runners → the runner →
# Remove. GitHub shows the exact command; the token is valid for ~1 hour.
sudo -u deploy -H bash -c 'cd /home/deploy/actions-runner && ./config.sh remove --token <REPO_REMOVAL_TOKEN>'
```

```bash
# 3. Register against the ORG (as deploy, NOT root).
# Registration token: ORG → Settings → Actions → Runners → New runner.
# Also ~1 hour. Get a fresh one; do not reuse the removal token from step 2.
sudo -u deploy -H bash -c 'cd /home/deploy/actions-runner && ./config.sh --url https://github.com/Foovante-Tech-Op --token <ORG_REGISTRATION_TOKEN> --labels crevy-vps --unattended --replace'
```

```bash
# 4. Reinstall the unit, running as the deploy user (the trailing argument).
sudo bash -c 'cd /home/deploy/actions-runner && ./svc.sh install deploy && ./svc.sh start'
sudo bash -c 'cd /home/deploy/actions-runner && ./svc.sh status'
```

```bash
# 5. Confirm the job environment survived re-registration. `.env` carries
# KUBECONFIG and `.path` carries PATH; the deploy job calls bare `kubectl` with
# no --kubeconfig flag, so without `.env` it authenticates as nobody and the
# failure looks like an RBAC problem rather than a missing file.
sudo cat /home/deploy/actions-runner/.env
sudo cat /home/deploy/actions-runner/.path
```

If either is missing, recreate it:

```bash
sudo bash -c 'echo "KUBECONFIG=/home/deploy/.kube/config" > /home/deploy/actions-runner/.env'
sudo bash -c 'echo "PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin" > /home/deploy/actions-runner/.path'
sudo chown deploy:deploy /home/deploy/actions-runner/.env /home/deploy/actions-runner/.path
sudo bash -c 'cd /home/deploy/actions-runner && ./svc.sh stop && ./svc.sh start'
```

Org-level self-hosted runners **do** work for private repos on GitHub Free —
unlike org secrets (A1). The runner lands in the **Default** runner group,
which is available to every repository in the org, so both repos can reach it
with nothing further to configure. Creating additional runner groups, or
restricting a group to selected repositories, is the part that needs GitHub
Team — you do not need either.

Check Org → Settings → Actions → **Runners** and confirm the runner is listed
there rather than under crevy-backend's own Runners page. If you are on Team or
Enterprise and the runner is in a restricted group, grant that group access to
both repos — an org runner in a group no repo can reach behaves exactly like no
runner at all.

`--labels crevy-vps` is not optional. `runs-on` needs both `self-hosted` (added
automatically) and `crevy-vps`; a runner missing the second label shows as Idle
and never claims the job, which from the Actions log is indistinguishable from
having no runner.

Confirm both repos see it as **Idle** before moving on. Re-run one backend
deploy to prove you did not break the pipeline that already worked.

### A5. Let the deploy SA create Deployments — recommended

On the VPS as an admin:

```bash
sudo k3s kubectl patch role crevy-deploy-role -n crevy --type=json \
  -p '[{"op":"add","path":"/rules/0/verbs/-","value":"create"}]'

sudo k3s kubectl get role crevy-deploy-role -n crevy -o yaml | head -20
```

The security delta is negligible: `patch`/`update` on Deployments already lets
that SA change any image or command in the namespace. What it buys is that
`k8s/deployment.yaml` is applied by CI from the repo, for this service and for
any future one, instead of drifting from a hand-applied copy.

Skip this only if you would rather keep the Role exactly as-is — then do C3
instead.

### A6. Code scanning (optional)

Repo → Settings → Code security → enable **Code scanning**. Until it is on, the
three `upload-sarif` steps fail and are swallowed by `continue-on-error`; the
"gate on CRITICAL/HIGH" steps are what actually enforce anything either way.

---

## Phase B — Cluster prep (admin, by hand on the VPS)

### B1. Check headroom

```bash
sudo k3s kubectl top nodes
free -h
```

The frontend requests 256Mi and caps at 1Gi, same shape as the backend. If the
node is already tight, drop `limits.memory` to 512Mi before applying — Next's
standalone server idles well under that; it is the build that is hungry, and
that happens on GitHub's runner, not here.

### B2. Confirm the GHCR pull secret exists

```bash
sudo k3s kubectl get secret ghcr-pull -n crevy
```

The frontend Deployment reuses it — same registry, same org, same PAT. If it is
missing, the pod sits in `ImagePullBackOff` while `kubectl rollout status`
reports only "timed out waiting for the condition", pointing nowhere near the
registry.

### B3. Apply the resources CI cannot

```bash
cd ~/crevy-frontend   # or wherever you clone it
git pull
sudo k3s kubectl apply -f k8s/configmap.yaml -f k8s/service.yaml -n crevy
```

Not the Ingress yet — that comes in Phase E with the TLS secret it references.
Not the Deployment yet — there is no image to pull until Phase C.

---

## Phase C — First build and first rollout

### C1. Commit and push

```bash
git add Dockerfile .dockerignore .nvmrc next.config.ts k8s/ .github/ \
        sonar-project.properties DEPLOY.md
git commit -m "feat(deploy): containerize and deploy crevy-frontend to k3s"
git push origin main
```

Note the repo has unrelated work in progress (`MAKEOVER.md`, `globals.css`,
`layout.tsx`, `SmoothScroll.tsx`, `PrimaryMarketplaceHero.tsx`, `assets/`,
`public/fonts/`). Decide separately whether those go in the same commit.

### C2. Watch the build job

It runs: lint → typecheck → Trivy fs (report + gate) → SonarCloud → build image
→ Trivy image (report + gate) → push to GHCR.

The **Trivy gates** fail the run on any CRITICAL or HIGH. The first run hit ten
HIGH findings; they are fixed, and the dependency floors below are what keeps
them fixed. If a gate fails again, read the finding before reaching for
`severity:` — the answer here was to fix the dependency, not to widen the gate.

#### Dependency security floors — do not downgrade past these

| Package | Floor | Why |
|---|---|---|
| `next` | `^16.3.2` | 16.2.9 carried an **authentication bypass** (CVE-2026-64642), two SSRFs (64645, 64649) and a DoS (64641), all fixed in 16.2.11. 16.3.2 is chosen over 16.2.12 because it also pins `postcss 8.5.23` and `sharp ^0.35.3`, which is what clears those two findings without an override. |
| `better-auth` | `^1.6.22` | 1.6.19 allowed **account takeover via pre-account hijacking** on magic-link and email-OTP sign-in (GHSA-qq9h-g4jm-xgf3). This resolves to 1.7.1 — the same version crevy-backend resolves, which is deliberate: the frontend's `authClient` and the backend's better-auth server should not skew. Check both repos together when bumping either. |

Verified after the bump: `trivy fs . --scanners vuln --severity CRITICAL,HIGH`
reports 0, `tsc --noEmit` and `biome check` pass, `next build` is clean, and the
staged standalone server serves `/` and `/_next/static/*` as 200 with the CSP
intact.

Two vulnerable copies remain in `pnpm-lock.yaml` and are **correctly** not
flagged — both are dev-only, and Trivy suppresses dev dependencies:

- `sharp@0.34.5` via `wrangler` → `miniflare`
- `nanoid@3.3.13` via `@tailwindcss/postcss` → `postcss@8.5.15`

Neither reaches the runtime image, which contains only `.next/standalone` plus
`.next/static` and `public`. Removing the dead Cloudflare tooling (Phase F)
eliminates the `sharp` one outright.

### C3. First rollout

**If you did A5**, the deploy job creates the Deployment itself and this step is
already done. Skip to C4.

**If you skipped A5**, the deploy job fails on RBAC. That is expected once.
Take the SHA the build job pushed and apply by hand:

```bash
SHA=$(git rev-parse HEAD)
sed -E "s#^( *image: )ghcr\.io/.*#\1ghcr.io/foovante-tech-op/crevy-frontend:${SHA}#" \
  k8s/deployment.yaml | sudo k3s kubectl apply -n crevy -f -
```

Then re-run the deploy job. Every push after this is a patch, which the Role
already permits.

### C4. Verify in-cluster, before any DNS exists

```bash
sudo k3s kubectl get pods -n crevy -l app=crevy-frontend
sudo k3s kubectl logs -n crevy -l app=crevy-frontend --tail=50

sudo k3s kubectl port-forward -n crevy svc/crevy-frontend-service 8080:80 &
curl -sI http://127.0.0.1:8080/ | head -1                    # 200
curl -s  http://127.0.0.1:8080/ | grep -o '/_next/static[^"]*' | head -1
curl -sI http://127.0.0.1:8080/api/v2/health | head -1        # 200 through the rewrite
```

That last one is the real test: it proves the in-cluster rewrite to
`crevy-backend-service` resolves. If it 404s, `NEXT_PUBLIC_API_URL` was missing
at build time and the destination compiled to `undefined/...` — rebuild, do not
debug the cluster.

Also confirm the CSP came out right:

```bash
curl -sI http://127.0.0.1:8080/ | grep -i content-security-policy
```

`img-src` must contain the `pub-*.r2.dev` origin and `connect-src` the
`*.r2.cloudflarestorage.com` one. If either is absent the corresponding repo
variable was not set — see A3.

---

## Phase D — DNS and TLS (Phase 5b, both hostnames)

Order deliberately differs from `CLOUDFLARE_MIGRATION.md`: **prove the Origin CA
setup on `crevy.` first**, where there is no traffic to break, and move the live
API only once you have seen it work. Same destination, one fewer thing riding on
an untested change.

### D1. Generate one Origin CA certificate for both hosts

Cloudflare → **SSL/TLS → Origin Server → Create Certificate**.

Hostnames: `api.foovanteglobal.earth`, `crevy.foovanteglobal.earth`

**The private key is shown exactly once.** Save both PEM blocks now.

One certificate covering both means one Secret to create and one thing to
replace in 15 years. Both Ingresses reference `crevy-origin-tls`.

### D2. Create the Secret

```bash
sudo k3s kubectl create secret tls crevy-origin-tls \
  --cert=origin.pem --key=origin.key -n crevy
```

Harmless on its own — nothing references it yet.

### D3. Set the zone to Full (strict)

Cloudflare → SSL/TLS → Overview → **Full (strict)**.

Safe right now: `api` is grey-clouded so the mode does not apply to it, and the
apex on Pages is Cloudflare-to-Cloudflare either way.

**This must happen before any orange cloud.** Flexible talks to the origin over
plain HTTP, and both Ingresses 308-redirect HTTP to HTTPS — an infinite loop.

### D4. Bring up `crevy.` proxied from the start

```bash
sudo k3s kubectl apply -f k8s/ingress.yaml -n crevy
```

Cloudflare → DNS → `A  crevy  →  169.58.154.18`, **orange cloud**.

Never grey-cloud this host, not even briefly. An Origin CA certificate is
trusted only by Cloudflare; grey-clouded it fails TLS for every visitor.

```bash
curl -sI https://crevy.foovanteglobal.earth | head -1     # 200
echo | openssl s_client -connect crevy.foovanteglobal.earth:443 \
  -servername crevy.foovanteglobal.earth 2>/dev/null \
  | openssl x509 -noout -issuer                            # Cloudflare
```

Then log in through the UI. That exercises the whole chain — same-origin cookie
via the Next rewrite, `SITE_URL` for `getServerSession`, the backend's
`BETTER_AUTH_URL`. If login succeeds but leaves no session, check Phase E first.

### D5. Move `api.` the same way

Only now, with the pattern proven.

In `crevy-backend/k8s/ingress.yaml`:

```diff
   annotations:
-    cert-manager.io/cluster-issuer: letsencrypt-prod
   spec:
     tls:
       - hosts:
           - api.foovanteglobal.earth
-        secretName: crevy-backend-tls
+        secretName: crevy-origin-tls
```

```bash
sudo k3s kubectl apply -f k8s/ingress.yaml -n crevy
```

Then immediately Cloudflare → DNS → `api` → **orange cloud**.

Between the apply and the orange cloud, `api` serves a cert only Cloudflare
trusts, to a hostname nothing is proxying. Direct visitors get a TLS error for
that window. Keep it to seconds — have the DNS tab open before you run the
apply.

```bash
curl -sI https://api.foovanteglobal.earth/api/v2/health | head -1
echo | openssl s_client -connect api.foovanteglobal.earth:443 \
  -servername api.foovanteglobal.earth 2>/dev/null \
  | openssl x509 -noout -issuer                            # Cloudflare, not Let's Encrypt
```

### D6. Lock the origin to Cloudflare

Not optional once you are proxying. `trust proxy` is `true` on the backend, so
anyone who can reach the VPS directly can forge `X-Forwarded-For` and walk past
Arcjet's per-IP limits.

**Confirm SSH is on its own rule before running this.**

```bash
sudo ufw status numbered          # check SSH first. Seriously.

sudo ufw delete allow 80/tcp
sudo ufw delete allow 443/tcp
for ip in $(curl -s https://www.cloudflare.com/ips-v4); do
  sudo ufw allow from "$ip" to any port 443 proto tcp
done
for ip in $(curl -s https://www.cloudflare.com/ips-v6); do
  sudo ufw allow from "$ip" to any port 443 proto tcp
done
```

### D7. Retire cert-manager — last, and only after D5 is green

```bash
sudo k3s kubectl delete -f k8s/cert-manager-issuer.yaml
sudo k3s kubectl delete secret crevy-backend-tls -n crevy
sudo k3s kubectl delete -f \
  https://github.com/cert-manager/cert-manager/releases/download/v1.21.1/cert-manager.yaml
```

Leave it installed until everything above passes. It costs nothing idle and it
is the fallback if the Origin CA path does not come back clean.

---

## Phase E — Backend configuration

`crevy-backend/k8s/configmap.yaml` already carries the final values
(commit `d7c5144`). Confirm they are actually applied to the live cluster —
a ConfigMap edit does nothing to a running container until the pod restarts:

```bash
sudo k3s kubectl get configmap backend-config -n crevy -o yaml | grep -E 'FRONTEND_URL|BETTER_AUTH_URL'
```

Expected:

```
FRONTEND_URL     = https://crevy.foovanteglobal.earth
BETTER_AUTH_URL  = https://crevy.foovanteglobal.earth/api/auth
```

`BETTER_AUTH_URL` is the **frontend's** URL, not the API's — the frontend
proxies `/api/auth/*` through a Next rewrite so cookies are set same-origin.
The comment in the backend's `.env` claiming otherwise is wrong.

If they differ:

```bash
cd ~/crevy-backend && git pull
sudo k3s kubectl apply -f k8s/configmap.yaml -n crevy
sudo k3s kubectl rollout restart deployment/crevy-backend -n crevy
```

---

## Phase F — Cleanup, after everything above is green

Deliberately last. None of it is required to ship, and doing it before the
first green deploy means any breakage has two possible causes.

1. **Strip the dead Cloudflare/Vercel/Netlify tooling from this repo.**
   `@opennextjs/cloudflare`, `wrangler`, `@cloudflare/next-on-pages`, the
   `pages:build` / `preview` / `deploy` / `cf-typegen` scripts,
   `open-next.config.ts`, `wrangler.jsonc`, `netlify.toml`, `.vercel/`.

   Nothing in `src/` imports any of it — confirmed. It is dead weight *and* a
   footgun: `pnpm deploy` currently pushes to Cloudflare instead of building
   the container, and those devDependencies are extra surface for the Trivy
   filesystem gate to fail on.

   It has also started actively getting in the way. `@cloudflare/next-on-pages`
   declares `next@">=14.3.0 && <=15.5.2"` and is missing a `vercel` peer
   entirely, so every `pnpm install` now prints:

   ```
   WARN  Issues with peer dependencies found
   └─┬ @cloudflare/next-on-pages 1.13.16
     ├── ✕ missing peer vercel@">=30.0.0 && <=47.0.4"
     └── ✕ unmet peer next@">=14.3.0 && <=15.5.2": found 16.3.2
   ```

   A warning, not an error — `--frozen-lockfile` still succeeds, verified. But
   it is permanent noise that will mask a real peer conflict later, and it
   means the package cannot follow this repo's Next version anyway.

   Re-run the build after removing them; the lockfile change means a fresh
   image.

2. **Trim the stale allowed origins in the backend** (`src/index.ts`
   `allowedOrigins`, `src/shared/utils/auth.ts` `trustedOrigins`) down to
   `http://localhost:3000` plus `settings.FRONTEND_URL`. Each stale entry is an
   origin permitted to make credentialed requests.

3. Delete the Netlify site and any unused Vercel projects.

---

## Still open from HANDOFF.md — unrelated to this deploy, more urgent than it

- **Email Routing is almost certainly down and failing silently.** The MX
  records still point at `eforward*.registrar-servers.com`, but Namecheap Email
  Forwarding only works while the domain uses Namecheap nameservers. Cloudflare
  → Email → Email Routing → verify a destination → enable. It rewrites the MX
  records itself. Nothing bounces visibly; it just looks like nobody is
  emailing.
- **Rotate the exposed secrets**: postgres (`ALTER USER`, not just the Secret —
  `POSTGRES_PASSWORD` applies at initdb only), redis, Neon, Upstash,
  `BETTER_AUTH_SECRET`. Use `openssl rand -hex 32` so the values are
  alphanumeric and no URL-encoding traps appear in connection strings.
- Delete `testsa@gmail.com` once a real super_admin is invited.
- Delete `~/crevy-backend.pre-clone` on the VPS — plaintext secrets.
- **`SONAR_TOKEN` now exists in two repos** (crevy-backend and crevy-frontend),
  because org secrets cannot reach private repos on GitHub Free — see A1.
  Rotating it means updating both, and neither repo can tell you whether the
  other is current. Collapse them into one org secret if the org moves to
  GitHub Team.

---

## Rollback

There is no previous production deployment of this frontend to return to, so
"rollback" means the pieces around it:

| What | How |
|---|---|
| A bad frontend image | `kubectl rollout undo deployment/crevy-frontend -n crevy` |
| The frontend entirely | Delete the `crevy` DNS record. Nothing else references the host. |
| The `api` TLS change | Restore `cert-manager.io/cluster-issuer` + `secretName: crevy-backend-tls`, apply, grey-cloud `api`, re-open ufw 80/443. Only possible while cert-manager is still installed — which is why D7 is last. |
