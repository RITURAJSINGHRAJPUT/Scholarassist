# Product Requirements Document (PRD): ScholarAssist

## 1. Product Overview
**ScholarAssist** is a professional, full-stack web application designed to connect students with expert academic advisors. The platform provides guidance for thesis writing, research papers, essays, and project documentation. Furthermore, it offers free academic integrity tools like an AI Content Detector and a Plagiarism Checker.

## 2. Target Audience
- **Primary Users (Students/Researchers):** Individuals seeking professional academic assistance, thesis guidance, or reliable tools to check their work for AI generation/plagiarism.
- **Secondary Users (Platform Administrators):** Content managers and advisors who manage incoming academic inquiries, moderate testimonials, and publish blog content for SEO and user engagement.

## 3. Key Features & Requirements

### 3.1 Public-Facing Website
- **SEO-Optimized Pages:** Static and dynamic pages including Home, Services, About, Contact, Confidentiality, and Blog.
- **Consultation Workflow:** A multi-step consultation form allowing users to submit academic inquiries along with secure file uploads (with strict type and size validation).
- **Blog System:** A dynamic, SEO-friendly blog categorized by topics, featuring rich text and images.
- **Testimonials:** A review system to display verified student successes on the homepage.
- **Responsive Interface:** A seamless experience across desktop, tablet, and mobile browsers.

### 3.2 Free Academic Tools
- **AI Content Detector:** A utility powered by Hugging Face's RoBERTa model to evaluate student submissions and detect patterns typical of AI-generated content (e.g., ChatGPT, Claude).
- **Plagiarism Checker:** A tool that utilizes web search APIs to cross-reference text against public sources, ensuring originality and academic integrity.

### 3.3 Secure Admin Panel
- **Dashboard:** High-level metrics showing active inquiries, blog performance, and overall site analytics.
- **Inquiry Management:** A CRM-like interface to view, respond to, and export student consultation requests.
- **Content Management System (CMS):**
  - **Blog:** Create, edit, schedule, publish, or unpublish articles. Includes image upload functionality.
  - **Categories:** Define and manage taxonomy for blog articles.
  - **Testimonials:** Add, edit, and approve student reviews for public display.

## 4. Technical Specifications

### 4.1 Technology Stack
- **Frontend Layer:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS.
- **Backend Layer:** Node.js, Express.js, RESTful API architecture.
- **Database Layer:** PostgreSQL.
- **Authentication:** JSON Web Tokens (JWT) coupled with bcrypt for secure password hashing.

### 4.2 Security & Compliance
- **Protection:** Implementation of Helmet.js, strict CORS policies, Rate Limiting, and robust XSS sanitization.
- **File Uploads:** Handled via Multer with strict constraints on allowable MIME types and maximum file sizes.
- **Access Control:** Route-level protection for all Admin Panel endpoints.

## 5. Deployment Strategy
- **Frontend Architecture:** Deployed via Netlify (or Vercel) for global CDN distribution.
- **Backend & Database:** Node.js server hosted on platforms like Render or a dedicated VPS (e.g., DigitalOcean) running Node environments with PM2. Database hosted on Supabase or an equivalent Managed PostgreSQL instance.
