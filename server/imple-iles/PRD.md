# Product Requirements Document (PRD): ScholarAssist

## 1. Executive Summary
ScholarAssist is a premium academic guidance platform designed to bridge the gap between students and expert academic advisors. It provides an all-in-one suite of tools for research paper writing, AI content detection, and plagiarism checking, alongside a robust consultation management system.

---

## 2. Product Vision
To be the most trusted and efficient platform for academic excellence, providing students with state-of-the-art tools and professional guidance to produce high-quality, original research and documentation.

---

## 3. Target Audience
- **Undergraduate & Postgraduate Students**: Writing theses, dissertations, and essays.
- **Researchers**: Looking for IEEE/APA-compliant formatting and AI detection.
- **Academic Professionals**: Managing student inquiries and providing specialized guidance.
- **Administrative Staff**: Monitoring platform usage and managing content (blogs, testimonials).

---

## 4. Core Features & Functional Requirements

### 4.1. Intelligent Academic Editor
- **Multi-Template Support**: Integrated templates for IEEE Conference Papers, Academic Papers, Case Studies, and Literature Reviews.
- **Layout Management**: Support for single-column and standard IEEE two-column layouts.
- **Real-time Formatting**: Toolbar for typography, tables, images, and alignment (powered by Tiptap).
- **AI Heatmap Preview**: Side-by-side analysis window showing sentence-level AI probability scores using a heatmap.
- **Export Capabilities**: Clean PDF and DOCX export with preserved formatting.
- **Cloud Sync**: Auto-save functionality with manual "Save to History" option for authenticated users.

### 4.2. AI Content Detector
- **Deep Analysis**: Uses the Hugging Face RoBERTa model to distinguish between human and AI-authored text (ChatGPT, Claude, etc.).
- **Sentence-level Granularity**: Provides probability scores for individual segments.
- **File Upload Support**: Accepts PDF, DOCX, and TXT files for comprehensive analysis.

### 4.3. Plagiarism Checker
- **Hybrid Search Engine**: Combines **DuckDuckGo HTML** for web-wide plagiarism and **CrossRef API** for academic paper matching.
- **Information Density Ranking**: Prioritizes checking sentences with high "information density" to improve accuracy and speed.
- **Verdict System**: Categorizes results into Original, Low, Moderate, or High plagiarism.
- **Source Attribution**: Provides direct URLs and similarity percentages for flagged segments.

### 4.4. Lead & Inquiry Management
- **Multi-step Consultation Form**: Collects student details, academic level, service type, and deadlines.
- **Secure File Upload**: Encrypted storage of supporting documents with type and size validation.
- **Inquiry Dashboard**: Admin interface to track, update (New -> In Progress -> Completed), and manage inquiries.

### 4.5. Content Management System (CMS)
- **Dynamic Blog**: Category-based system with SEO-optimized slugs, excerpts, and featured images.
- **Testimonial Engine**: User submission flow with an admin approval process and "Published" status toggle.

### 4.6. Authentication & User Management
- **Role-based Access**: Separate schemas for `admin_users` (panel access) and `app_users` (public tools access).
- **Premium Subscription**: Tiered system (Free vs. Premium) with daily usage tracking for plagiarism and AI tools.

---

## 5. Technical Architecture

### 5.1. Tech Stack
- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS.
- **Backend**: Node.js, Express.js (RESTful API).
- **Database**: PostgreSQL (managed via Supabase or local instance).
- **Editor Engine**: Tiptap (Headless Rich Text Editor).
- **Authentication**: JWT (JSON Web Tokens) with Bcrypt password hashing.

### 5.2. Data Model Highlights
- **UUID Primary Keys**: Used across all tables for enhanced security and scalability.
- **Row Level Security (RLS)**: Implemented at the database level to ensure data privacy for user documents.
- **Usage Tracking**: Per-user, per-day tracking of tool hits (`plagiarism_count`, `ai_detector_count`).

---

## 6. Non-Functional Requirements

### 6.1. Security
- **Data Encryption**: IV-based encryption for uploaded sensitive files.
- **API Protection**: Rate limiting on sensitive endpoints (Auth, AI Check).
- **Input Sanitization**: XSS protection using `dompurify` and backend validation.

### 6.2. Performance & SEO
- **Server Component Optimization**: Next.js SSR/ISR for blog and public pages.
- **Dynamic Meta Tags**: Automated SEO titles and descriptions for every blog post.
- **Lazy Loading**: Deferred loading of heavy libraries like `html2pdf.js` and `mammoth`.

---

## 7. User Flows

### 7.1. Student Journey
1. Landmark on Homepage -> Browse Services.
2. Use Free AI/Plagiarism tools -> Hit Limit -> Prompt to Login/Premium.
3. Access Editor -> Choose IEE Template -> Write & Format -> Export PDF.

### 7.2. Admin Journey
1. Login to `/admin/login`.
2. View Inquiries -> Review uploaded files -> Update student status.
3. Write Blog Post -> Add Category -> Publish to Live Site.

---

## 8. Roadmap & Future Scope
- **Real-time Collaboration**: Multi-user editing in the research paper editor.
- **BibTeX Integration**: Automated citation management and bibliography generation.
- **AI Writing Assistant**: Integration with LLMs for real-time grammar suggestions and phrasing.
- **Email Notifications**: Automated alerts for inquiry status changes via Resend/SendGrid.

---
**Report Generated by ScholarAssist System Analyst**
**Date**: April 2026
