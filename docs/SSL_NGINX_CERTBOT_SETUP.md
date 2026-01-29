# SSL Setup: markano.tech (Nginx + Certbot)

**SSL waxaa si toos ah loo orodaa VPS-ka marka push kasta ee `main`:** GitHub Actions wuxuu orodaa `scripts/setup-ssl-markano.sh` (Nginx + Certbot), kadibna `scripts/verify-ssl-vps.sh` (xaqiijin). Config-ka Nginx ee SSL (Certbot) lama overwrite-garo deploy kasta; firewall (UFW) waa la furan yahay 80 iyo 443.

**Haddii SSL weli aanu shaqeyn:** Script-ku wuxuu hadda isticmaalaa **fallback**: haddii certificate jiro laakiin Nginx aanu dhageysan 443, wuxuu qoraya config buuxda (HTTP redirect + HTTPS proxy). Sidaas run: `sudo bash /root/markanoLst/scripts/setup-ssl-markano.sh` VPS-ka (ama push to main). Xaqiijin: `sudo bash scripts/verify-ssl-vps.sh`.

## Commands executed (on VPS as root)

1. **Inspect Nginx configs**
   - `ls -la /etc/nginx/sites-available`
   - `ls -la /etc/nginx/sites-enabled`

2. **Backup and write HTTP server block**
   - Backups: `/etc/nginx/sites-available/markano.tech.bak.*`, `default.bak.*`
   - Write: `/etc/nginx/sites-available/markano.tech` (listen 80; server_name markano.tech www.markano.tech; proxy to http://127.0.0.1:3000)

3. **Enable site and remove conflicting blocks**
   - `rm -f /etc/nginx/sites-enabled/default`
   - `rm -f /etc/nginx/sites-enabled/markano`
   - `ln -sf /etc/nginx/sites-available/markano.tech /etc/nginx/sites-enabled/markano.tech`

4. **Test and reload Nginx**
   - `nginx -t`
   - `systemctl reload nginx`

5. **Run Certbot**
   - `certbot --nginx -d markano.tech -d www.markano.tech --non-interactive --agree-tos --email admin@markano.tech --redirect`
   - Certbot adds HTTPS server blocks and HTTP → HTTPS redirect.

6. **Verify HTTPS**
   - `curl -sI https://markano.tech`
   - `curl -sI https://www.markano.tech`

7. **Auto-renew**
   - `systemctl enable certbot.timer && systemctl start certbot.timer` (or cron fallback)

---

## Files changed

| Path | Action |
|------|--------|
| `/etc/nginx/sites-available/markano.tech` | Created/overwritten (single HTTP block; Certbot then adds SSL) |
| `/etc/nginx/sites-enabled/default` | Removed (conflicting) |
| `/etc/nginx/sites-enabled/markano` | Removed if present |
| `/etc/nginx/sites-enabled/markano.tech` | Symlink to sites-available/markano.tech |
| `/etc/letsencrypt/` | Certbot writes certificates and keys here |
| Nginx config | Certbot modifies markano.tech to add `listen 443 ssl` and redirect |

---

## Run the full setup on the VPS

From your **local machine** (replace `VPS_IP` with your server IP):

```bash
ssh root@VPS_IP "cd /root/markanoLst && git pull && sudo bash scripts/setup-ssl-markano.sh"
```

Or **on the VPS** (after `cd /root/markanoLst` or project root):

```bash
sudo bash scripts/setup-ssl-markano.sh
```

---

## Final verification steps

1. **Nginx config**
   ```bash
   sudo nginx -t
   ls -la /etc/nginx/sites-enabled
   ```

2. **HTTPS**
   ```bash
   curl -sI https://markano.tech   # Expect 200 or 301/302
   curl -sI https://www.markano.tech
   ```

3. **HTTP → HTTPS redirect**
   ```bash
   curl -sI http://markano.tech    # Expect 301 to https://
   ```

4. **Auto-renew**
   ```bash
   sudo certbot renew --dry-run
   sudo systemctl status certbot.timer   # if using timer
   ```

---

## Confirmation

After the script runs successfully:

- **https://markano.tech** serves the Next.js app over SSL.
- **https://www.markano.tech** works.
- HTTP requests to markano.tech and www.markano.tech redirect to HTTPS.
- Certbot renewal is enabled (timer or cron).

Repo reference config (HTTP-only, pre-Certbot): `scripts/nginx/markano.tech.conf`.
