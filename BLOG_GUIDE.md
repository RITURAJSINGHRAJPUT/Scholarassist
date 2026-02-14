# ScholarAssist Blog Post Creation Guide

## Accessing the Admin Panel

1. Go to **http://localhost:3000/admin/login**
2. Login with your admin credentials:
   - **Username:** `admin`
   - **Password:** `admin123`
3. You'll be redirected to the admin dashboard

---

## Creating a New Blog Post

### Step 1: Navigate to Blog Management
- Click **"Blog"** in the admin sidebar
- Click **"New Post"** button on the blog management page
- Or go directly to: **http://localhost:3000/admin/blog/new**

### Step 2: Fill in the Post Details

| Field | Required | Description |
|-------|----------|-------------|
| **Title** | ✅ Yes | The headline of your blog post |
| **Featured Image** | No | Click the upload area to add a cover image (JPEG, PNG, GIF, WebP — max 10MB) |
| **Content** | ✅ Yes | The full blog post body text |
| **Excerpt** | No | A short summary shown on the blog listing page |
| **Category** | No | Select from existing categories or create a new one |
| **Meta Title** | No | Custom SEO title (uses post title if empty) |
| **Meta Description** | No | SEO description for search engines |
| **Publish immediately** | No | Check to make the post visible on the public blog |

### Step 3: Adding a Featured Image
1. Click the dashed upload area
2. Select an image from your computer
3. The image preview will appear with a loading indicator
4. Click the **✕** button to remove and re-upload if needed

### Step 4: Selecting or Creating a Category
- Use the **dropdown** to select an existing category
- Click **"+ Create new category"** to add a new one inline
- Type the category name and click **"Add"**

### Step 5: Publishing
- **Draft:** Leave "Publish immediately" unchecked — the post saves but won't appear on the public blog
- **Publish:** Check "Publish immediately" — the post goes live instantly
- Click **"Create Post"** to save

---

## Managing Existing Posts

On the **Blog Management** page (`/admin/blog`):
- **Toggle publish status** — Click the publish toggle to show/hide posts
- **Edit** — Click a post to modify its content
- **Delete** — Remove a post permanently

---

## Available Categories

The following categories are pre-configured:

| Category | Description |
|----------|-------------|
| Thesis Writing | Tips and guides for thesis and dissertation writing |
| Research Papers | Research methodology, paper structure, and writing advice |
| Essay & Projects | Essay writing tips and project help |
| Academic Writing | General academic writing style and best practices |
| Student Life | Time management, study tips, and student wellbeing |
| Career & Education | Career guidance and higher education insights |

You can create additional categories directly from the new post form.

---

## Tips for Great Blog Posts

1. **Use descriptive titles** — They appear in search results and on the blog listing
2. **Write a compelling excerpt** — This is the preview text visitors see before clicking
3. **Add a featured image** — Posts with images get significantly more engagement
4. **Choose a category** — Helps organize posts and improves navigation
5. **Fill in SEO fields** — Meta title and description boost search engine visibility
6. **Preview before publishing** — Save as draft first, review on the site, then publish
