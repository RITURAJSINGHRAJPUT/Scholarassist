# ScholarAssist — Hosting & Deployment Guide

This guide covers deploying your Next.js frontend + Express backend + PostgreSQL database to production.

---

## Architecture Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Next.js App   │────▶│  Express API    │────▶│   PostgreSQL    │
│  (Port 3000)    │     │  (Port 5000)    │     │  (Port 5432)    │
│  Vercel / VPS   │     │  Render / VPS   │     │  Supabase / VPS │
└─────────────────┘     └─────────────────┘     └─────────────────┘
     client/                 server/
```

---

## Option A: Free Tier Hosting (Recommended for Starting Out)

| Component | Host | Free Tier |
|-----------|------|-----------|
| **Frontend** | [Vercel](https://vercel.com) | Unlimited |
| **Backend API** | [Render](https://render.com) | 750 hrs/month |
| **Database** | [Supabase](https://supabase.com) or [Neon](https://neon.tech) | 500 MB |

---

### Step 1: Set Up PostgreSQL Database

#### Option: Supabase (Easiest)
1. Go to [supabase.com](https://supabase.com) → Create a new project
2. Set a **database password** and choose a region close to you
3. Once created, go to **Settings → Database → Connection string → URI**
4. Copy the connection string — it looks like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```
5. Go to **SQL Editor** and paste the contents of `server/db/schema.sql` → Run

#### Option: Neon (Alternative)
1. Go to [neon.tech](https://neon.tech) → Create a project
2. Copy the connection string from the dashboard
3. Use the SQL editor to run `server/db/schema.sql`

---

### Step 2: Deploy the Backend (Express API)

#### Using Render.com

1. Push your code to **GitHub**
2. Go to [render.com](https://render.com) → **New → Web Service**
3. Connect your GitHub repo
4. Configure:

   | Setting | Value |
   |---------|-------|
   | **Name** | `scholarassist-api` |
   | **Root Directory** | `server` |
   | **Runtime** | Node |
   | **Build Command** | `npm install` |
   | **Start Command** | `npm start` |

5. Add **Environment Variables**:

   ```
   PORT=5000
   NODE_ENV=production
   DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   JWT_SECRET=[generate-a-strong-random-string]
   JWT_EXPIRES_IN=24h
   CLIENT_URL=https://your-frontend-domain.vercel.app
   ENCRYPTION_KEY=[32-char-hex-string]
   MAX_FILE_SIZE=10485760
   UPLOAD_DIR=./uploads
   ```

   > **Important:** Generate a strong JWT_SECRET using:
   > ```bash
   > node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   > ```

6. Click **Create Web Service** → Wait for deployment
7. Note your backend URL — e.g. `https://scholarassist-api.onrender.com`

---

### Step 3: Deploy the Frontend (Next.js)

#### Using Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import your GitHub repo
3. Configure:

   | Setting | Value |
   |---------|-------|
   | **Root Directory** | `client` |
   | **Framework** | Next.js (auto-detected) |

4. Add **Environment Variable**:

   ```
   NEXT_PUBLIC_API_URL=https://scholarassist-api.onrender.com/api
   ```

5. Click **Deploy**
6. Note your frontend URL — e.g. `https://scholarassist.vercel.app`

#### After Deploying:
Go back to **Render** and update the `CLIENT_URL` env variable to your Vercel URL:
```
CLIENT_URL=https://scholarassist.vercel.app
```

---

### Step 4: Seed the Admin User

After deployment, seed the admin account by calling the API:

```bash
curl -X POST https://scholarassist-api.onrender.com/api/auth/seed
```

This creates the default admin: **username** `admin` / **password** `admin123`

> ⚠️ **Change the admin password immediately after first login!**

---

### Step 5: Set Up Custom Domain (Optional)

#### On Vercel (Frontend):
1. Go to Project Settings → **Domains**
2. Add your domain (e.g. `scholarassist.com`)
3. Update DNS records as instructed (CNAME or A record)

#### On Render (Backend API):
1. Go to your service → **Settings → Custom Domain**
2. Add `api.scholarassist.com`
3. Update DNS records

#### Update Environment Variables:
- **Render**: `CLIENT_URL=https://scholarassist.com`
- **Vercel**: `NEXT_PUBLIC_API_URL=https://api.scholarassist.com/api`

---

## Option B: VPS Hosting (Full Control)

For more control, use a VPS from **DigitalOcean**, **Hetzner**, or **AWS Lightsail** (~$5-10/month).

### 1. Server Setup

```bash
# SSH into your VPS
ssh root@your-server-ip

# Update system
apt update && apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install PostgreSQL
apt install -y postgresql postgresql-contrib

# Install Nginx
apt install -y nginx

# Install PM2 (process manager)
npm install -g pm2
```

### 2. Set Up PostgreSQL

```bash
sudo -u postgres psql

CREATE DATABASE scholarassist;
CREATE USER scholars WITH PASSWORD 'your-strong-password';
GRANT ALL PRIVILEGES ON DATABASE scholarassist TO scholars;
\q

# Import schema
sudo -u postgres psql scholarassist < server/db/schema.sql
```

### 3. Deploy Code

```bash
# Clone your repo
cd /var/www
git clone https://github.com/your-username/ScholarSync.git
cd ScholarSync

# Backend
cd server
npm install
cp .env.example .env   # Edit with production values
npm start              # Test it works, then Ctrl+C

# Frontend
cd ../client
npm install
npm run build

# Start with PM2
cd /var/www/ScholarSync
pm2 start server/src/index.js --name "scholarassist-api"
pm2 start npm --name "scholarassist-frontend" -- start --prefix client
pm2 save
pm2 startup
```

### 4. Nginx Configuration

```nginx
# /etc/nginx/sites-available/scholarassist
server {
    listen 80;
    server_name scholarassist.com www.scholarassist.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $host;
    }

    # Uploaded files
    location /uploads/ {
        proxy_pass http://localhost:5000;
    }
}
```

```bash
# Enable site
ln -s /etc/nginx/sites-available/scholarassist /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### 5. SSL (HTTPS) with Let's Encrypt

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d scholarassist.com -d www.scholarassist.com
```

---

## Production Environment Variables

### Backend (`server/.env`)

```env
PORT=5000
NODE_ENV=production
DATABASE_URL=postgresql://scholars:your-strong-password@localhost:5432/scholarassist
JWT_SECRET=<generate-64-byte-random-hex>
JWT_EXPIRES_IN=24h
CLIENT_URL=https://scholarassist.com
ENCRYPTION_KEY=<generate-32-char-hex>
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads

# Email — for contact form to work
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
ADMIN_EMAIL=admin@scholarassist.com

# reCAPTCHA — to prevent spam
RECAPTCHA_SECRET_KEY=<your-recaptcha-secret>
```

### Frontend (`client/.env.local`)

```env
NEXT_PUBLIC_API_URL=https://api.scholarassist.com/api
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=<your-recaptcha-site-key>
```

---

## Post-Deployment Checklist

- [ ] Run schema.sql on production database
- [ ] Seed admin user (`POST /api/auth/seed`)
- [ ] Change admin password after first login
- [ ] Set strong JWT_SECRET
- [ ] Configure SMTP for email notifications
- [ ] Set up reCAPTCHA keys
- [ ] Enable SSL/HTTPS
- [ ] Update CLIENT_URL and NEXT_PUBLIC_API_URL
- [ ] Test all pages: homepage, blog, consultation form, admin login
- [ ] Set up database backups

---

## Updating the Site

### On Render + Vercel:
Push to GitHub — both auto-deploy.

### On VPS:
```bash
cd /var/www/ScholarSync
git pull origin main
cd server && npm install
cd ../client && npm install && npm run build
pm2 restart all
```
