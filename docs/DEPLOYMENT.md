# Tanzmoment – Deployment-Runbook (Soft-Launch)

Schritt-für-Schritt-Anleitung, um Tanzmoment auf einem Hetzner-Server hinter einem
Cloudflare-Tunnel + Access-Gate produktiv zu betreiben. **Soft-Launch** = nur
Daniela + Jan erreichen die Seite (E-Mail-Allowlist am Edge), alle anderen sind
ausgesperrt.

Die Repo-Artefakte (`apps/api/Dockerfile`, `apps/web/Dockerfile`, `Caddyfile`,
`docker-compose.prod.yml`, `apps/api/entrypoint.sh`, `apps/api/prisma/bootstrap.ts`,
`.env.prod.example`) sind fertig und lokal end-to-end verifiziert. Dieses Runbook
deckt die Infrastruktur ab (Server, Domain, Cloudflare, Secrets, Deploy).

---

## Architektur (ein Origin)

```
Browser ──HTTPS──▶ Cloudflare Edge ──▶ Access-Gate (E-Mail-PIN)
                        │
                        ▼ (outbound Tunnel, keine offenen Ports)
                   cloudflared ──▶ web (Caddy :80)
                                     ├─ /api/*     ─▶ api:3000  (NestJS)
                                     ├─ /uploads/* ─▶ api:3000  (statische Bilder)
                                     └─ Rest       ─▶ statisches Angular-SPA
                                            │
                                   api ──▶ postgres:5432 , redis:6379
```

- **TLS** terminiert an der Cloudflare-Edge; intern läuft alles über HTTP im
  Docker-Netz. Es werden **keine Host-Ports** veröffentlicht – der Tunnel ist der
  einzige Eingang.
- **Single-Origin**: SPA, API und Uploads liegen auf derselben Domain, damit die
  HttpOnly-Auth-Cookies first-party bleiben.

---

## Voraussetzungen (vorher besorgen)

- [ ] Hetzner-Cloud-Account
- [ ] Domain (Registrar frei wählbar) – NS werden auf Cloudflare umgestellt
- [ ] Cloudflare-Account (kostenlos)
- [ ] Stripe-Account mit **TEST**-Keys (`sk_test_…`)
- [ ] SMTP-Zugang (Ethereal reicht für den Soft-Launch NICHT für echte Mails –
      für echten Mailversand Resend/SendGrid, siehe Public-Launch)
- [ ] SSH-Key für den Server

---

## Phase 1 – Server (Hetzner CX22)

1. **Server erstellen**: CX22 (2 vCPU / 4 GB), Standort **Falkenstein oder
   Nürnberg** (DE → GDPR), Image **Ubuntu 24.04**, eigenen SSH-Key hinterlegen.
2. **SSH-Hardening** (als root, dann neuen User):
   ```bash
   adduser deploy && usermod -aG sudo deploy
   rsync --archive --chown=deploy:deploy ~/.ssh /home/deploy
   # /etc/ssh/sshd_config: PermitRootLogin no ; PasswordAuthentication no
   systemctl restart ssh
   apt update && apt install -y ufw fail2ban unattended-upgrades
   ufw default deny incoming && ufw default allow outgoing
   ufw allow OpenSSH && ufw enable
   ```
   > Es müssen **keine** HTTP/HTTPS-Ports geöffnet werden – cloudflared baut die
   > Verbindung ausgehend auf. Nur SSH bleibt offen.
3. **Docker + Compose installieren**:
   ```bash
   curl -fsSL https://get.docker.com | sh
   usermod -aG docker deploy
   docker compose version   # v2 Plugin ist enthalten
   ```
4. **Repo holen** (privates Repo → Deploy-Key oder HTTPS-Token):
   ```bash
   git clone https://github.com/jankr02/tanzmoment.git
   cd tanzmoment && git checkout master
   ```
   > Die Images werden **auf dem Server** gebaut (amd64), daher keine
   > Registry/kein Cross-Build nötig.

---

## Phase 2 – Domain + Cloudflare

1. Domain im Registrar registrieren.
2. In Cloudflare **Add a site** → Domain eintragen → die angezeigten **Nameserver**
   beim Registrar setzen. NS-Umstellung kann einige Stunden dauern.
3. Noch **kein** DNS-A-Record nötig – der Tunnel legt den benötigten CNAME selbst an.

> Hinweis: `tanzmoment.de` ist aktuell an mehreren Stellen im Frontend hartcodiert
> (`seo.types.ts`, `index.html`, `sitemap.xml`). Für den **Soft-Launch hinter dem
> Gate** unkritisch; vor dem Public-Launch auf die echte Domain anpassen.

---

## Phase 3 – Secrets: `.env.prod`

Auf dem Server im Repo-Root:

```bash
cp .env.prod.example .env.prod
chmod 600 .env.prod          # root/deploy-owned, NIE committen (ist gitignored)
```

Werte setzen (siehe Kommentare in `.env.prod.example`):

| Variable | Wert |
| --- | --- |
| `NODE_ENV` | `production` |
| `POSTGRES_USER` / `POSTGRES_DB` | frei, z.B. `tanzmoment` |
| `POSTGRES_PASSWORD` | **URL-safe** generieren: `openssl rand -hex 32` (wird in `DATABASE_URL` interpoliert – keine `/ @ : # ? %`-Zeichen!) |
| `JWT_SECRET` | `openssl rand -base64 48` (App bootet sonst nicht) |
| `JWT_EXPIRES_IN` / `REFRESH_TOKEN_TTL` | `15m` / `30d` (Defaults ok) |
| `COOKIE_SAMESITE` | `lax` |
| `COOKIE_SECURE` | **leer lassen** → leitet `true` aus `NODE_ENV=production` ab |
| `COOKIE_DOMAIN` | leer |
| `TRUST_PROXY` | mit `2` starten, nach Deploy verifizieren (Phase 8) |
| `FRONTEND_URL` **und** `APP_URL` | **beide exakt** `https://<domain>` (kein Trailing-Slash) |
| `STRIPE_SECRET_KEY` | `sk_test_…` |
| `STRIPE_WEBHOOK_SECRET` | wird in Phase 6 gesetzt |
| `SMTP_*` | echte SMTP-Werte (oder für reinen Preview leer → Ethereal-Testmails) |
| `RUN_BOOTSTRAP` | `true` für das **erste** Deploy |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Danielas Login (starkes PW, min. 10 Zeichen, nicht `admin123`) |
| `ADMIN_FIRST_NAME` / `ADMIN_LAST_NAME` | Danielas Name (später im Admin editierbar) |
| `LOCATION_NAME` / `LOCATION_ADDRESS` | Platzhalter-Location (Daniela benennt sie später um) |
| `TUNNEL_TOKEN` | wird in Phase 4 gesetzt |

---

## Phase 4 – Cloudflare Tunnel (cloudflared)

1. Cloudflare Dashboard → **Zero Trust** → **Networks → Tunnels** →
   **Create a tunnel** → *Cloudflared* → Namen vergeben.
2. Den angezeigten **Tunnel-Token** kopieren → in `.env.prod` als `TUNNEL_TOKEN`.
3. **Public Hostname** konfigurieren:
   - Subdomain/Domain: `<domain>`
   - Service: **`HTTP`** → **`web:80`**
   > `web` ist der Caddy-Service im Compose-Netz; cloudflared läuft im selben Netz
   > und erreicht ihn unter diesem Namen. Cloudflare legt den passenden CNAME
   > automatisch an.

---

## Phase 5 – Cloudflare Access (das Gate)

1. Zero Trust → **Access → Applications** → **Add an application** →
   *Self-hosted*.
2. Application-Domain: `<domain>`.
3. **Policy**: *Allow* → Selector **Emails** → Danielas + Jans Adresse
   (`jankg416@posteo.de`). Login-Methode **One-Time-PIN**.
4. **KRITISCH – Webhook-Bypass**: eine **zweite** Access-Application für den Pfad
   `<domain>/api/payments/webhook` anlegen mit Policy **Bypass** (Include →
   *Everyone*). Sonst blockt das Gate Stripes Server-POST mit 403.
   > Alternativ per Path-basierter Regel/Service-Token – Hauptsache dieser eine
   > Pfad ist vom PIN-Gate ausgenommen.

---

## Phase 6 – Stripe TEST-Webhook

1. Stripe Dashboard (**Test-Modus**) → **Developers → Webhooks → Add endpoint**.
2. Endpoint-URL: `https://<domain>/api/payments/webhook`.
3. Events auswählen: `checkout.session.completed`,
   `checkout.session.async_payment_succeeded`,
   `checkout.session.async_payment_failed`, `checkout.session.expired`,
   `charge.refunded`.
4. **Signing secret** (`whsec_…`) kopieren → `.env.prod` als `STRIPE_WEBHOOK_SECRET`.

---

## Phase 7 – Deploy

```bash
# Baut alle Images und startet postgres, redis, api, web + den Tunnel:
docker compose --env-file .env.prod -f docker-compose.prod.yml --profile tunnel up -d --build
```

Ablauf beim Start (automatisch, siehe `apps/api/entrypoint.sh`):
1. `prisma migrate deploy` – legt das komplette Schema an.
2. Bootstrap (weil `RUN_BOOTSTRAP=true`): Admin + gekoppelter Instructor +
   Location + Default-Storno-Policy. **Idempotent** – bei jedem Neustart sicher.
3. `node main.js` – API startet.

`postgres`/`redis`/`api` haben Healthchecks; `api` startet erst, wenn DB **und**
Redis gesund sind.

> Nach dem ersten erfolgreichen Deploy kann `RUN_BOOTSTRAP` in `.env.prod` auf
> `false` gesetzt werden (schadet aber nicht, da idempotent).

---

## Phase 8 – Verifizieren

```bash
# Alle Container gesund?
docker compose --env-file .env.prod -f docker-compose.prod.yml ps

# Health intern (grün = DB + Redis ok):
docker compose --env-file .env.prod -f docker-compose.prod.yml exec api \
  node -e "require('http').get('http://127.0.0.1:3000/api/health',r=>{let d='';r.on('data',c=>d+=c);r.on('end',()=>console.log(r.statusCode,d))})"
```

Checkliste:
- [ ] `https://<domain>` fragt nach dem Cloudflare-PIN → nach Login lädt die SPA.
- [ ] Login als Daniela (`ADMIN_EMAIL`/`ADMIN_PASSWORD`) funktioniert; `/admin`
      ist erreichbar.
- [ ] Set-Cookie trägt **Secure + HttpOnly + SameSite=Lax** durch den Edge
      (DevTools → Application → Cookies).
- [ ] **TRUST_PROXY prüfen**: `docker compose … logs api` zeigt **echte
      Client-IPs**, nicht die Proxy-IP. Falls die Proxy-IP erscheint, Hop-Zahl in
      `.env.prod` anpassen und `api` neu starten.
- [ ] Stripe: im Dashboard „Send test webhook" oder `stripe trigger
      checkout.session.completed` → Endpoint antwortet **200**.
- [ ] Test-Kontaktformular abschicken → Mail kommt an (wenn SMTP gesetzt).

---

## Phase 9 – Danielas Content (nach dem Gate)

- [ ] Location im Admin öffnen und mit echtem Namen + Adresse überschreiben.
- [ ] Kurse + Sessions anlegen, Preise/Termine setzen, **veröffentlichen**
      (`isPublished`).

---

## Betrieb

- **Logs**: `docker compose --env-file .env.prod -f docker-compose.prod.yml logs -f api`
- **Update**: `git pull && docker compose --env-file .env.prod -f docker-compose.prod.yml --profile tunnel up -d --build`
- **DB-Backup** (empfohlen, cron):
  ```bash
  docker compose --env-file .env.prod -f docker-compose.prod.yml exec -T postgres \
    pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" | gzip > backup-$(date +%F).sql.gz
  ```
  Restore einmal testen.
- **Uptime-Monitor** (UptimeRobot o.ä.) auf `https://<domain>/api/health` – braucht
  jedoch einen Access-Bypass/Service-Token für diesen Pfad, sonst greift das PIN-Gate.

---

## Gotchas (aus der Verifikation)

- **URL-safe DB-Passwort**: `POSTGRES_PASSWORD` wird unescaped in `DATABASE_URL`
  interpoliert → nur `openssl rand -hex 32` o.ä. verwenden.
- **`--env-file .env.prod` ist Pflicht**: sonst bleiben interpolierte Werte
  (DATABASE_URL) leer und der Stack startet falsch.
- **API + Redis**: Die API blockiert beim Start, solange Redis nicht erreichbar
  ist (BullMQ-Scheduler). `depends_on: service_healthy` deckt das ab; fällt Redis
  im Betrieb länger aus, `api` danach neu starten.
- **Nur EIN Instructor** wird geseedet (Daniela). Kursanlegen ohne Instructor-
  Auswahl funktioniert, weil die API automatisch auf diesen Instructor zurückfällt.
- **Dev-Seed niemals in Prod**: `apps/api/prisma/seed.ts` bricht unter
  `NODE_ENV=production` ab; der Entrypoint ruft ausschließlich den Bootstrap.

---

## Go-Live (Public – später)

Wenn die Seite öffentlich gehen soll:
1. Cloudflare-Access-**Policy löschen** (Gate entfernen).
2. `apps/web/public/robots.txt` auf das öffentliche Ruleset zurückdrehen:
   ```
   User-agent: *
   Allow: /
   Disallow: /admin
   Disallow: /admin/
   Disallow: /auth/

   Sitemap: https://<domain>/sitemap.xml
   ```
3. Stripe auf **Live-Keys** + Live-Webhook umstellen.
4. Echten Mail-Provider (Resend/SendGrid) mit SPF/DKIM/DMARC.
5. Rechtstexte (Impressum, AGB/Widerruf, Datenschutz) füllen + prüfen lassen.
6. Frontend-CSP/HSTS an der Edge, Domain-Platzhalter ersetzen.

> Vollständige Public-Launch-Checkliste: siehe interne Go-Live-Notizen
> (`project_golive_deployment.md`, Abschnitt **B**).
```
