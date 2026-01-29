# MinIO Object Storage – VPS Setup (Markano)

MinIO is S3-compatible object storage. On the VPS you run MinIO for **all file uploads** (instructor profile images, general uploads).

---

## 1. Install MinIO on VPS

### Option A: Script (recommended)

On your VPS:

```bash
cd /path/to/markanoLst
chmod +x scripts/setup-minio-vps.sh
./scripts/setup-minio-vps.sh
```

Optional env vars before running:

- `MINIO_USER` – default `minioadmin`
- `MINIO_PASSWORD` – default `minioadmin` (change in production)
- `MINIO_DATA_DIR` – default `/opt/minio/data`
- `MINIO_BUCKET` – default `markano`
- `MINIO_PORT` – default `9000`
- `MINIO_CONSOLE_PORT` – default `9001`

### Option B: Docker

```bash
docker run -d \
  --name minio \
  -p 9000:9000 -p 9001:9001 \
  -e MINIO_ROOT_USER=minioadmin \
  -e MINIO_ROOT_PASSWORD=your-secure-password \
  -v /opt/minio/data:/data \
  minio/minio server /data --console-address ":9001"
```

Create bucket:

```bash
# Install mc: https://min.io/docs/minio/linux/reference/minio-mc.html
mc alias set myminio http://127.0.0.1:9000 minioadmin your-secure-password
mc mb myminio/markano --ignore-existing
mc anonymous set download myminio/markano
```

---

## 2. Environment variables (Markano app)

On the **same VPS** where the Next.js app runs, or in your deploy env:

```env
MINIO_ENDPOINT=http://127.0.0.1:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=your-secure-password
MINIO_BUCKET=markano
MINIO_PUBLIC_URL=http://YOUR_VPS_PUBLIC_IP:9000/markano
```

- **MINIO_ENDPOINT** – MinIO API URL. From the app server use `http://127.0.0.1:9000` if MinIO is on the same machine.
- **MINIO_PUBLIC_URL** – Base URL used to build public object URLs (e.g. for profile images). Browsers must be able to open this; use your VPS public IP or a domain.

---

## 3. Nginx in front of MinIO (HTTPS, optional)

To serve MinIO over HTTPS and avoid mixed content:

1. Point a subdomain (e.g. `minio.markano.app`) to your VPS.
2. In Nginx, proxy that host to `http://127.0.0.1:9000`.
3. Set in env:

```env
MINIO_PUBLIC_URL=https://minio.markano.app/markano
```

Example Nginx location (bucket in path):

```nginx
location /markano/ {
    proxy_pass http://127.0.0.1:9000/markano/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

---

## 4. Instructor profile image flow

1. Instructor goes to **Profile** in the instructor dashboard.
2. Clicks **Change photo** and selects an image (JPEG, PNG, GIF, WebP, max 5MB).
3. Frontend sends the file to **POST /api/instructor/profile/upload**.
4. Backend uploads to MinIO (folder `instructor-profiles/`), updates `instructors.profile_image_url`, and optionally deletes the previous image.
5. Profile page shows the new image using `MINIO_PUBLIC_URL` + object key.

---

## 5. Security

- Use a strong **MINIO_SECRET_KEY** (and MINIO_ROOT_PASSWORD) in production.
- Prefer **HTTPS** for MINIO_PUBLIC_URL (Nginx + SSL).
- Restrict MinIO ports (9000, 9001) to localhost or a private network if the app and MinIO are on the same VPS.
