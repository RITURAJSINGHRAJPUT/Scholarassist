# Research Paper Editor Module — Implementation Plan

Integrate a rich-text research paper editor into ScholarAssist. Students will write, format, auto-save, and export academic papers as PDFs from a new `/editor` route, without breaking existing features.

## User Review Required

> [!IMPORTANT]
> **Authentication model**: The current app only has `admin_users` in the DB with JWT auth. The PRD references "authenticated users" for `/editor`. I will **reuse the existing admin auth pattern** (same `admin_token` in localStorage, same JWT middleware) so that any logged-in admin can access the editor. If you later add a separate student-user auth system, the editor routes can be migrated. Please confirm this is acceptable.

> [!WARNING]
> **TipTap version**: I will install `@tiptap/react` v2 (latest stable) compatible with React 19. This adds ~8 new dependencies to the client.

---

## Proposed Changes

### Database Schema

#### [MODIFY] [schema.sql](file:///Users/rituraj/Downloads/Projects/Scholarassist-main/server/db/schema.sql)

Append `documents` table:

```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES admin_users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Untitled Document',
  content JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_documents_user ON documents(user_id);
CREATE INDEX idx_documents_updated ON documents(updated_at DESC);
```

---

### Backend API

#### [NEW] [documentRoutes.js](file:///Users/rituraj/Downloads/Projects/Scholarassist-main/server/src/routes/documentRoutes.js)

Express router with 5 endpoints, all protected by existing [authenticate](file:///Users/rituraj/Downloads/Projects/Scholarassist-main/server/src/middleware/auth.js#4-28) middleware:

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/documents` | Create new document |
| `GET` | `/api/documents` | List user's documents |
| `GET` | `/api/documents/:id` | Fetch single document (ownership check) |
| `PUT` | `/api/documents/:id` | Update document (ownership check, XSS sanitize) |
| `DELETE` | `/api/documents/:id` | Delete document (ownership check) |

Uses `xss` package (already installed) for HTML sanitization.

#### [MODIFY] [index.js](file:///Users/rituraj/Downloads/Projects/Scholarassist-main/server/src/index.js)

Add `require` and `app.use('/api/documents', documentRoutes)` alongside existing routes.

---

### Client Dependencies

#### [MODIFY] [package.json](file:///Users/rituraj/Downloads/Projects/Scholarassist-main/client/package.json)

Install via npm:
- `@tiptap/react`, `@tiptap/pm`, `@tiptap/starter-kit`
- `@tiptap/extension-underline`, `@tiptap/extension-text-align`, `@tiptap/extension-table`, `@tiptap/extension-table-row`, `@tiptap/extension-table-cell`, `@tiptap/extension-table-header`, `@tiptap/extension-image`, `@tiptap/extension-placeholder`
- `html2pdf.js`

---

### Editor Route & Components

#### [NEW] [layout.tsx](file:///Users/rituraj/Downloads/Projects/Scholarassist-main/client/src/app/editor/layout.tsx)

- Auth guard (checks `admin_token` in localStorage, redirects to `/admin/login`)
- Hides root Navbar/Footer for a fullscreen editor experience
- Shows loading spinner while checking auth

#### [NEW] [page.tsx](file:///Users/rituraj/Downloads/Projects/Scholarassist-main/client/src/app/editor/page.tsx)

Main `ResearchEditor` component:
- **Top toolbar** (fixed) — formatting buttons via `EditorToolbar`
- **Left sidebar** — academic sections nav via `SectionsSidebar`
- **Main area** — A4-style paper (794px, white, shadow, margins)
- **Right sidebar** — document stats via `DocumentStats`
- Auto-save via `useAutoSave` hook
- Export PDF button using `html2pdf.js`
- Document list/new document management

#### [NEW] [EditorToolbar.tsx](file:///Users/rituraj/Downloads/Projects/Scholarassist-main/client/src/components/editor/EditorToolbar.tsx)

Toolbar with buttons for: Bold, Italic, Underline, H1/H2/H3, Bullet List, Ordered List, Text Align (left/center/right), Table insert, Image upload, Undo/Redo. Save status indicator.

#### [NEW] [SectionsSidebar.tsx](file:///Users/rituraj/Downloads/Projects/Scholarassist-main/client/src/components/editor/SectionsSidebar.tsx)

Preloaded academic sections (Title, Abstract, Introduction, Methodology, Results, Conclusion, References). Click to scroll. Insert new section button.

#### [NEW] [DocumentStats.tsx](file:///Users/rituraj/Downloads/Projects/Scholarassist-main/client/src/components/editor/DocumentStats.tsx)

Live word count, character count, section count, estimated read time.

#### [NEW] [useAutoSave.ts](file:///Users/rituraj/Downloads/Projects/Scholarassist-main/client/src/lib/useAutoSave.ts)

Hook that debounces editor content changes (3s), calls PUT `/api/documents/:id`, manages "Saving…" / "Saved" status.

#### [NEW] [useDocuments.ts](file:///Users/rituraj/Downloads/Projects/Scholarassist-main/client/src/lib/useDocuments.ts)

API helper hooks for document CRUD operations using existing [api.ts](file:///Users/rituraj/Downloads/Projects/Scholarassist-main/client/src/lib/api.ts) axios instance.

---

### Navbar Integration

#### [MODIFY] [Navbar.tsx](file:///Users/rituraj/Downloads/Projects/Scholarassist-main/client/src/components/Navbar.tsx)

Add `{ name: 'Research Editor', href: '/editor' }` to the `tools` array so it appears in the Tools dropdown.

---

## Verification Plan

### Manual Verification (Browser)

1. **Start the dev servers**: `npm run dev` from the project root
2. **Verify existing pages**: Navigate to `/`, `/plagiarism-checker`, `/ai-detector`, `/blog`, `/admin` — confirm nothing is broken
3. **Check Navbar**: Verify "Research Editor" appears in the Tools dropdown
4. **Test editor auth**: Navigate to `/editor` without being logged in → should redirect to `/admin/login`
5. **Test editor access**: Log in as admin, navigate to `/editor` → editor should load
6. **Test editor features**: Type text, apply bold/italic/underline, insert headings, lists, tables
7. **Test sidebar navigation**: Click sections to verify auto-scroll
8. **Test auto-save**: Type content, wait 3s, verify "Saved" status appears
9. **Test PDF export**: Click "Export as PDF", verify downloaded PDF matches A4 layout
10. **Test document CRUD**: Create new document, reload page, verify it persists
