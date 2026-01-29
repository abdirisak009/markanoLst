# GitHub Actions Guide – MarkanoLst

**Hordhac (Introduction)**  
Qoraalkan wuxuu kuu sharaxayaa talaabooyinka aad qaadatay iyo waxa aad ii bixineysaa si GitHub Action loo sameeyo. Kadib markaad tixgeliso oo diiwaangaliso, waxaan kuu dhisaynaa Action-ka.

This guide explains **what you need to do** and **what you need to give me** before we create the GitHub Action for this project.

---

## 1. Maxay noqon doontaa GitHub Action-ka? (What will the Action do?)

Waa in aad ii sheegtaa maxaad rabtaa in Action-ku sameeyo. Tusaale ahaan:

| Option | Description |
|--------|-------------|
| **A) CI (Build & Test)** | On every push/PR: run `npm install`, `npm run build`, maybe `npm run lint`. Fail if build breaks. |
| **B) Deploy to VPS** | When you push to `main` (or a tag): SSH to your server, pull code, run build, restart PM2. |
| **C) Both** | CI on every push + auto-deploy to VPS when merging to `main`. |

**Waxa iga rabo (What I need from you):**  
Sheeg **A**, **B**, ama **C** (ama wax kale sida: deploy to Vercel, run tests only, etc.).

---

## 2. Talaabooyinka aad qaadatay (Steps you must take)

### 2.1 GitHub repo

- Code-kaagu waa inuu joogaa **GitHub repository** (public ama private).
- **Waxa iga rabo:** Repo name (e.g. `your-username/markanoLst`) – haddii aad isticmaasho SSH deploy, repo URL waa kaa filan.

### 2.2 GitHub Secrets (for Deploy)

Haddii aad doonaysid **deploy to VPS** (B ama C), GitHub waa inuu la socdaa server-ka. Sidaas awgeed waxaad u baahan tahay **Secrets**:

| Secret name | Waxa loo isticmaalo | Sida loo sameeyo |
|-------------|---------------------|------------------|
| `SSH_HOST` | IP-ka server-ka (e.g. `168.231.85.21`) | Repo → Settings → Secrets and variables → Actions → New repository secret |
| `SSH_USER` | Username (e.g. `root`) | Same |
| `SSH_PRIVATE_KEY` | **Full content** of your private key (e.g. `~/.ssh/id_rsa`) – the one that logs into the VPS without password | Copy-paste the entire key including `-----BEGIN ... -----` and `-----END ... -----` |

**Talaabooyinka:**

1. GitHub repo-gaaga → **Settings** → **Secrets and variables** → **Actions**.
2. **New repository secret**.
3. Name: `SSH_HOST`, Value: IP (e.g. `168.231.85.21`) → Add.
4. Name: `SSH_USER`, Value: `root` (ama user-ka SSH) → Add.
5. Name: `SSH_PRIVATE_KEY`, Value: *content of your private key file* → Add.

**Waxa iga rabo:**  
- Confirm inaad gelisay **SSH_HOST**, **SSH_USER**, **SSH_PRIVATE_KEY** (ama sheeg haddii aad isticmaanaysid password – waxaan kuu qeexaynaa sida loo isticmaalo).

### 2.3 (Optional) Other secrets

| Secret | When needed |
|--------|-------------|
| `DATABASE_URL` | Only if the Action runs something that needs the DB (e.g. migrations). For “build only” or “deploy existing .env on server” – not required in GitHub. |
| `NODE_ENV` | Usually not needed; server already has `NODE_ENV=production` in `.env`. |

**Waxa iga rabo:** Sheeg haddii aad rabto in Action-ku run tests/migrations that need `DATABASE_URL` or other env vars.

---

## 3. Waxa adigaa iga rabo (What you need from me)

Kadib markaad:

- **Sheegto** maxaad rabtaa (A, B, ama C),
- **Geliso** GitHub Secrets (SSH_HOST, SSH_USER, SSH_PRIVATE_KEY) haddii deploy,
- **Confirm** repo name / branch (e.g. `main`),

waxaan kuu sameeyaa:

1. **Workflow file(s)** – e.g. `.github/workflows/ci.yml` and/or `.github/workflows/deploy.yml`.
2. **Documentation** – sida Action-ku u shaqeeyo (triggers, branches, steps).
3. **Talaabooyin** – “After adding the workflow: push to `main` and check the Actions tab.”

---

## 4. Summary checklist (before we implement)

- [ ] **Maxaad rabtaa?** A (CI), B (Deploy), C (Both), or custom?
- [ ] **Repo** – on GitHub? Branch for deploy (e.g. `main`)?
- [ ] **Deploy:** Secrets `SSH_HOST`, `SSH_USER`, `SSH_PRIVATE_KEY` added?
- [ ] **Server:** Project path on VPS (e.g. `/root/markanoLst`) – confirm or tell me if different.
- [ ] **Extra:** Any other step (e.g. run migrations, clear cache) – sheeg.

Markaad buuxiso checklist-kan oo ii sheegtaa, waxaan sameeyaa GitHub Action-ka iyo documentation-ka final-ka.

---

## 5. Deploy workflow (waa la dhisay / Already set up)

**Maxa la dhisay:** Push to `main` → auto-deploy to VPS.

- **Workflow file:** `.github/workflows/deploy.yml`
- **Trigger:** Push to branch `main` (repo: [abdirisak009/markanoLst](https://github.com/abdirisak009/markanoLst))
- **Waxa ku dhaca:** GitHub Actions wuxuu SSH gareynaa VPS-ka, wuxuuna sameeyaa: `git pull` → `npm install` → `npm run build` → `pm2 restart markano-next`

### Talaabooyinka aad qaadatay (Steps you must do)

1. **GitHub Secrets** – Repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**:
   - `SSH_HOST` = IP-ka VPS-ka (e.g. `168.231.85.21`)
   - `SSH_USER` = `root` (ama user-ka SSH)
   - `SSH_PRIVATE_KEY` = **dhammaan** content-ka private key-ga (file-ka `~/.ssh/id_rsa`) – including `-----BEGIN ... -----` iyo `-----END ... -----`

2. **VPS first time:** Server-ka waa inuu kuu leeyahay repo-ga git clone. Haddii `/root/markanoLst` aanu hore ugu clone-garin, SSH garee server-ka oo run:
   ```bash
   cd /root
   git clone https://github.com/abdirisak009/markanoLst.git markanoLst
   cd markanoLst
   # .env waa inuu halkan ku jiraa (DATABASE_URL, NODE_ENV=production)
   ```

3. **Push to main:** Kadib markaad push gareysato branch-ka `main`, workflow-ku wuu socdaa, code-kana wuu u deploy-garayaa VPS-ka.

### Haddii deploy uu falayo (If deploy fails)

- **Actions** tab → click on the failed run → read the log.
- Badanaa: SSH_PRIVATE_KEY ma saxeyn, SSH_HOST/SSH_USER khalad, ama server-ka `/root/markanoLst` ma aha git repo (run server setup script above).

---

## 6. Waxaad ku dartaa GitHub repository-ga (What YOU add to GitHub – I did the rest)

**Inta kale (workflow, scripts, docs) aniga ayaan sameeyay.** Adiga waxaad kaliya ku dartaa repository-ga GitHub **3 Secrets** iyo **1 talaab** (first-time server setup).

### A) GitHub Secrets (kaliya 3)

Repo-gaaga: **Settings** → **Secrets and variables** → **Actions** → **New repository secret**.

| No | Name (exact)   | Value |
|----|----------------|-------|
| 1  | `SSH_HOST`     | IP-ka VPS-ka (tusaale: `168.231.85.21`) |
| 2  | `SSH_USER`     | User-ka SSH (tusaale: `root`) |
| 3  | `SSH_PRIVATE_KEY` | **Dhammaan** content-ka private key-ga. Haddii key-ga aad ku sameysay **server-ka**, server-ka ka qaado: `cat ~/.ssh/id_rsa` – copy **dhammaan** output-ka (oo ku jira `-----BEGIN ...` ilaa `-----END ...`) oo geli Value-ka. |

### B) First time: server-ka (mar kaliya)

SSH garee VPS-ka, project-ka soo deji (haddii aadan hore u clone-garin), ka dib run script-kan:

```bash
cd /root/markanoLst
bash scripts/server-setup-for-github-actions.sh
```

Script-ku wuxuu: public key-ga ku dariyaa `authorized_keys`, haddii loo baahan yahay wuu clone-garinayaa repo-ga, wuxuuna xaqiijinayaa `.env` iyo PM2 startup. Kadib samee `.env` (DATABASE_URL, NODE_ENV=production) haddii aadan hore u sameyn.

### C) Kadib: push to main

Markaad **push** gareeyato branch-ka **main**, GitHub Action-ku wuu socdaa, code-kana wuu u deploy-garayaa VPS-ka. Check: **Actions** tab → “Deploy to VPS”.

---

### Waxa aniga sameeyay (What I set up for you)

| Waxa | Fayl / qeexid |
|------|----------------|
| Deploy workflow (push → VPS) | `.github/workflows/deploy.yml` |
| Standalone start script (PM2) | `scripts/start-standalone.sh` |
| Server one-time setup script | `scripts/server-setup-for-github-actions.sh` |
| Documentation | `docs/GITHUB_ACTIONS_GUIDE.md` (qoraalkan) |

**Soo koob:** Ku dar 3 Secrets (SSH_HOST, SSH_USER, SSH_PRIVATE_KEY), run server setup script mar, kadib push to main – inta kale waa diyaar.
