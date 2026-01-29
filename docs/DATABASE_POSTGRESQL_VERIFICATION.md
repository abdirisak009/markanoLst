# Database: PostgreSQL Verification

**Nidaamku wuxuu isticmaalaa PostgreSQL.** Xiriirka waa `DATABASE_URL` (env). Waxaa loo tixgeli karaa Neon (cloud) ama PostgreSQL oo VPS-ka ku socda (local).

---

## 1. Xaqiijinta: App-ku waa PostgreSQL

| Shay | Qeexid |
|------|--------|
| **Nooca database** | PostgreSQL |
| **Connection** | `process.env.DATABASE_URL` – waa inuu noqdaa PostgreSQL URL (`postgresql://...`) |
| **Drivers** | `postgres` (postgres.js) – PostgreSQL connection via DATABASE_URL |

**Faylalka muhiimka ah:**
- `lib/db.ts` – `postgres(process.env.DATABASE_URL)` – PostgreSQL connection
- API routes – waxay isticmaalaan `postgres(DATABASE_URL)` (local PostgreSQL)

---

## 2. Halkee PostgreSQL-ku yaal?

- **Local PostgreSQL on VPS (recommended):**  
  Install PostgreSQL on the VPS, samee database, ka dib `DATABASE_URL` u qor:
  ```env
  DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/DATABASE_NAME
  ```
  Tusaale: `postgresql://markano:yourpassword@127.0.0.1:5432/markano`

---

## 3. Sida loo hubiyo VPS-ka (app iyo .env)

**1) Hubi in `.env` uu leeyahay `DATABASE_URL` (PostgreSQL):**
```bash
ssh root@YOUR_VPS_IP
cd /root/markanoLst
grep -E '^DATABASE_URL=' .env
```
Waa inaad aragtaa qoraal sidan: `DATABASE_URL=postgresql://...` (Neon ama localhost).

**2) Hubi in app-ku xiriirka u arko:**
- Haddii app-ku socdo (PM2), soo deji bogga admin ama API; haddii xogta laga soo qaado, database connection waa shaqeynaya.
- Optional: API test  
  `curl -s http://localhost:3000/api/universities` (haddii route-ku jiro) – haddii 200/JSON noqoto, app-ku DB-ka wuu isticmaalayaa.

**3) Learning Courses – xogta frontend iyo table-ka:**
- Admin bogga "Learning Courses" wuxuu ka soo qaadaa **dhammaan** courses (active iyo inactive) ee table-ka `learning_courses` (API: `GET /api/learning/courses?all=true` oo admin la aqoonsan yahay).
- Xogta waa isla database-ka ee `DATABASE_URL` (VPS-ka: PostgreSQL-ka local). Haddii frontend iyo table-ku kala duwan yihiin, hubi in app-ku (PM2) uu `.env` ka akhriyo `DATABASE_URL=postgresql://...@localhost:5432/markano` oo dib u bilow PM2.

**4) Table gold_student_devices (2-device limit):**  
Haddii table-ku aanu jirin VPS-ka, orod:  
`cd /root/markanoLst && bash scripts/run-054-gold-student-devices-on-vps.sh`  
Ama: `psql "$(grep '^DATABASE_URL=' .env | sed 's/^DATABASE_URL=//' | tr -d '\r\"')" -f scripts/054-gold-student-devices.sql`

**5) Haddii aad PostgreSQL ku samaysato VPS-ka (local):**
```bash
# Ubuntu/Debian
sudo apt update && sudo apt install -y postgresql postgresql-contrib
sudo -u postgres createuser -s markano
sudo -u postgres psql -c "ALTER USER markano PASSWORD 'yourpassword';"
sudo -u postgres createdb -O markano markano
```
Kadib `.env` ku beddel:
```env
DATABASE_URL=postgresql://markano:yourpassword@127.0.0.1:5432/markano
NODE_ENV=production
```
Ka dib run migrations (scripts-ka migration) oo restart PM2.

---

## 4. Soo koob

| Su'aal | Jawaab |
|-------|--------|
| System-ku ma isticmaalaa PostgreSQL? | **Haa.** PostgreSQL (via DATABASE_URL). |
| PostgreSQL-ku ma VPS-ka ku jiraa? | **Haa** – DATABASE_URL waa local: `postgresql://markano_user:PASSWORD@localhost:5432/markano` |
| Maxaan ku hubiyaa VPS? | `.env` ka eeg `DATABASE_URL=postgresql://...`; app run garee; API/UI ka eeg in xogta laga soo qaado. |
