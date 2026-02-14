# 🎓 ScholarAssist

**Professional Academic Guidance Platform** — A full-stack web application connecting students with expert academic advisors for thesis writing, research papers, essays, and project documentation.

[![Live Demo](https://img.shields.io/badge/Live-Demo-blue?style=for-the-badge)](https://scholarassist.vercel.app)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

---

## ✨ Features

### 🌐 Public Website
- **SEO-optimized pages** — Services, About, Contact, Confidentiality, Blog
- **Consultation form** — Multi-step form with file upload and validation
- **Blog** — Dynamic blog with categories, featured images, and SEO meta tags
- **Testimonials** — Student reviews displayed on the homepage
- **Responsive design** — Works beautifully on desktop, tablet, and mobile

### 🔐 Admin Panel
- **Dashboard** — Overview of inquiries, blog posts, and site analytics
- **Inquiry management** — View, respond to, and export student inquiries
- **Blog management** — Create, edit, publish/unpublish posts with image uploads
- **Testimonial management** — Add, edit, and publish student testimonials
- **Category management** — Organize blog posts with custom categories

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 16, React 19, TypeScript, Tailwind CSS |
| **Backend** | Node.js, Express.js, REST API |
| **Database** | PostgreSQL |
| **Auth** | JWT with bcrypt password hashing |
| **Security** | Helmet, CORS, Rate Limiting, XSS sanitization |
| **File Upload** | Multer with type/size validation |

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+
- **PostgreSQL** 14+

### 1. Clone & Install

```bash
git clone https://github.com/RITURAJSINGHRAJPUT/Scholarassist.git
cd Scholarassist

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 2. Database Setup

```bash
# Create database
psql -U postgres -c "CREATE DATABASE scholarassist;"

# Run schema
psql -U postgres -d scholarassist -f server/db/schema.sql
```

### 3. Environment Variables

```bash
# Copy example env file
cp server/.env.example server/.env
```

Edit `server/.env` with your database credentials:
```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/scholarassist
JWT_SECRET=your-secret-key
CLIENT_URL=http://localhost:3000
```

### 4. Run

```bash
# Terminal 1 — Backend
cd server
npm run dev

# Terminal 2 — Frontend
cd client
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

### 5. Create Admin Account

```bash
curl -X POST http://localhost:5000/api/auth/seed
```

Login at [http://localhost:3000/admin/login](http://localhost:3000/admin/login) with:
- **Username:** `admin`
- **Password:** `admin123`

---

## 📁 Project Structure

```
ScholarSync/
├── client/                 # Next.js frontend
│   ├── src/
│   │   ├── app/            # Pages (App Router)
│   │   ├── components/     # Reusable UI components
│   │   └── lib/            # API client, utilities
│   └── package.json
├── server/                 # Express backend
│   ├── src/
│   │   ├── routes/         # API route handlers
│   │   ├── middleware/      # Auth, security, upload
│   │   ├── config/         # Database connection
│   │   └── utils/          # Email, encryption, logging
│   ├── db/schema.sql       # Database schema
│   └── package.json
├── BLOG_GUIDE.md           # Blog post creation guide
├── HOSTING_GUIDE.md        # Deployment instructions
└── README.md
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/login` | Admin login |
| `GET` | `/api/blog/posts` | List published blog posts |
| `GET` | `/api/blog/posts/:slug` | Get single blog post |
| `GET` | `/api/blog/categories` | List blog categories |
| `GET` | `/api/testimonials` | List published testimonials |
| `POST` | `/api/inquiries` | Submit consultation inquiry |
| `POST` | `/api/contact` | Submit contact message |

> Admin endpoints require JWT authentication. See [HOSTING_GUIDE.md](HOSTING_GUIDE.md) for details.

---

## 🌍 Deployment

See the full [Hosting Guide](HOSTING_GUIDE.md) for step-by-step deployment instructions:

- **Free tier** — Vercel (frontend) + Render (backend) + Supabase (database)
- **VPS** — DigitalOcean / Hetzner with Nginx + PM2 + Let's Encrypt SSL

---

## 👤 Author

**Rituraj Singh Rajput**

- GitHub: [@RITURAJSINGHRAJPUT](https://github.com/RITURAJSINGHRAJPUT)

---

## 📄 License

This project is licensed under the MIT License.
