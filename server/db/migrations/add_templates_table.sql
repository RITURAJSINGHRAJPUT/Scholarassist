-- Create editor_templates table
CREATE TABLE IF NOT EXISTS editor_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(100), -- Lucide icon name or enum
  content JSONB NOT NULL, -- Prosemirror content
  layout VARCHAR(50) DEFAULT 'single',
  sections TEXT[] DEFAULT '{}',
  category VARCHAR(100) DEFAULT 'General',
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed existing templates
-- Academic Paper
INSERT INTO editor_templates (id, title, description, icon, content, layout, sections, category, display_order)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Academic Paper',
  'Standard research paper structure',
  'academic',
  '{"type": "doc", "content": [{"type": "heading", "attrs": {"level": 1}, "content": [{"type": "text", "text": "Title"}]}, {"type": "heading", "attrs": {"level": 2}, "content": [{"type": "text", "text": "Abstract"}]}, {"type": "paragraph", "content": [{"type": "text", "text": "Write your abstract here…"}]}, {"type": "heading", "attrs": {"level": 2}, "content": [{"type": "text", "text": "Introduction"}]}, {"type": "paragraph"}, {"type": "heading", "attrs": {"level": 2}, "content": [{"type": "text", "text": "Methodology"}]}, {"type": "paragraph"}, {"type": "heading", "attrs": {"level": 2}, "content": [{"type": "text", "text": "Results"}]}, {"type": "paragraph"}, {"type": "heading", "attrs": {"level": 2}, "content": [{"type": "text", "text": "Conclusion"}]}, {"type": "paragraph"}, {"type": "heading", "attrs": {"level": 2}, "content": [{"type": "text", "text": "References"}]}, {"type": "paragraph"}]}',
  'single',
  ARRAY['Title', 'Abstract', 'Introduction', 'Methodology', 'Results', 'Conclusion', 'References'],
  'Research',
  1
) ON CONFLICT (id) DO NOTHING;

-- Case Study
INSERT INTO editor_templates (id, title, description, icon, content, layout, sections, category, display_order)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  'Case Study',
  'Detailed analysis of a specific case',
  'case',
  '{"type": "doc", "content": [{"type": "heading", "attrs": {"level": 1}, "content": [{"type": "text", "text": "Case Study Title"}]}, {"type": "heading", "attrs": {"level": 2}, "content": [{"type": "text", "text": "Background"}]}, {"type": "paragraph"}, {"type": "heading", "attrs": {"level": 2}, "content": [{"type": "text", "text": "Case Description"}]}, {"type": "paragraph"}, {"type": "heading", "attrs": {"level": 2}, "content": [{"type": "text", "text": "Analysis"}]}, {"type": "paragraph"}, {"type": "heading", "attrs": {"level": 2}, "content": [{"type": "text", "text": "Recommendations"}]}, {"type": "paragraph"}, {"type": "heading", "attrs": {"level": 2}, "content": [{"type": "text", "text": "Conclusion"}]}, {"type": "paragraph"}]}',
  'single',
  ARRAY['Title', 'Background', 'Case Description', 'Analysis', 'Recommendations', 'Conclusion'],
  'Medical',
  2
) ON CONFLICT (id) DO NOTHING;

-- Literature Review
INSERT INTO editor_templates (id, title, description, icon, content, layout, sections, category, display_order)
VALUES (
  '33333333-3333-3333-3333-333333333333',
  'Literature Review',
  'Synthesis of existing research',
  'lit',
  '{"type": "doc", "content": [{"type": "heading", "attrs": {"level": 1}, "content": [{"type": "text", "text": "Literature Review Title"}]}, {"type": "heading", "attrs": {"level": 2}, "content": [{"type": "text", "text": "Introduction"}]}, {"type": "paragraph"}, {"type": "heading", "attrs": {"level": 2}, "content": [{"type": "text", "text": "Search Strategy"}]}, {"type": "paragraph"}, {"type": "heading", "attrs": {"level": 2}, "content": [{"type": "text", "text": "Literature Synthesis"}]}, {"type": "paragraph"}, {"type": "heading", "attrs": {"level": 2}, "content": [{"type": "text", "text": "Critical Discussion"}]}, {"type": "paragraph"}, {"type": "heading", "attrs": {"level": 2}, "content": [{"type": "text", "text": "Conclusion"}]}, {"type": "paragraph"}]}',
  'single',
  ARRAY['Title', 'Introduction', 'Search Strategy', 'Literature Synthesis', 'Critical Discussion', 'Conclusion'],
  'Review',
  3
) ON CONFLICT (id) DO NOTHING;

-- Lab Report
INSERT INTO editor_templates (id, title, description, icon, content, layout, sections, category, display_order)
VALUES (
  '44444444-4444-4444-4444-444444444444',
  'Lab Report',
  'Scientific experimental results',
  'lab',
  '{"type": "doc", "content": [{"type": "heading", "attrs": {"level": 1}, "content": [{"type": "text", "text": "Lab Report Title"}]}, {"type": "heading", "attrs": {"level": 2}, "content": [{"type": "text", "text": "Objective"}]}, {"type": "paragraph"}, {"type": "heading", "attrs": {"level": 2}, "content": [{"type": "text", "text": "Materials & Methods"}]}, {"type": "paragraph"}, {"type": "heading", "attrs": {"level": 2}, "content": [{"type": "text", "text": "Data & Results"}]}, {"type": "paragraph"}, {"type": "heading", "attrs": {"level": 2}, "content": [{"type": "text", "text": "Analysis"}]}, {"type": "paragraph"}, {"type": "heading", "attrs": {"level": 2}, "content": [{"type": "text", "text": "Conclusion"}]}, {"type": "paragraph"}]}',
  'single',
  ARRAY['Title', 'Objective', 'Materials & Methods', 'Data & Results', 'Analysis', 'Conclusion'],
  'Laboratory',
  4
) ON CONFLICT (id) DO NOTHING;

-- IEEE Template (The one we just worked on)
INSERT INTO editor_templates (id, title, description, icon, content, layout, sections, category, display_order)
VALUES (
  '55555555-5555-5555-5555-555555555555',
  'IEEE Conference Paper',
  'Official format for IEEE conference proceedings including multi-column authors and centered headings.',
  'ieee',
  '{"type": "doc", "content": [{"type": "heading", "attrs": {"level": 1, "textAlign": "center"}, "content": [{"type": "text", "text": "Paper Title* (use style: paper title)"}]}, {"type": "paragraph", "attrs": {"textAlign": "center"}, "content": [{"type": "text", "text": "*Note: Sub-titles are not captured in Xplore and should not be used", "marks": [{"type": "italic"}]}]}, {"type": "table", "content": [{"type": "tableRow", "content": [{"type": "tableCell", "content": [{"type": "paragraph", "attrs": {"textAlign": "center"}, "content": [{"type": "text", "text": "1st Given Name Surname", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": "center"}, "content": [{"type": "text", "text": "dept. name of organization", "marks": [{"type": "italic"}]}]}, {"type": "paragraph", "attrs": {"textAlign": "center"}, "content": [{"type": "text", "text": "(of Affiliation)"}]}, {"type": "paragraph", "attrs": {"textAlign": "center"}, "content": [{"type": "text", "text": "City, Country"}]}, {"type": "paragraph", "attrs": {"textAlign": "center"}, "content": [{"type": "text", "text": "email address or ORCID"}]}]}, {"type": "tableCell", "content": [{"type": "paragraph", "attrs": {"textAlign": "center"}, "content": [{"type": "text", "text": "2nd Given Name Surname", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": "center"}, "content": [{"type": "text", "text": "dept. name of organization", "marks": [{"type": "italic"}]}]}, {"type": "paragraph", "attrs": {"textAlign": "center"}, "content": [{"type": "text", "text": "(of Affiliation)"}]}, {"type": "paragraph", "attrs": {"textAlign": "center"}, "content": [{"type": "text", "text": "City, Country"}]}, {"type": "paragraph", "attrs": {"textAlign": "center"}, "content": [{"type": "text", "text": "email address or ORCID"}]}]}, {"type": "tableCell", "content": [{"type": "paragraph", "attrs": {"textAlign": "center"}, "content": [{"type": "text", "text": "3rd Given Name Surname", "marks": [{"type": "bold"}]}]}, {"type": "paragraph", "attrs": {"textAlign": "center"}, "content": [{"type": "text", "text": "dept. name of organization", "marks": [{"type": "italic"}]}]}, {"type": "paragraph", "attrs": {"textAlign": "center"}, "content": [{"type": "text", "text": "(of Affiliation)"}]}, {"type": "paragraph", "attrs": {"textAlign": "center"}, "content": [{"type": "text", "text": "City, Country"}]}, {"type": "paragraph", "attrs": {"textAlign": "center"}, "content": [{"type": "text", "text": "email address or ORCID"}]}]}]}]}, {"type": "paragraph", "content": [{"type": "text", "text": "Abstract---This electronic document is a “live” template and already defines the components of your paper [title, text, heads, etc.] in its style sheet. *CRITICAL: Do Not Use Symbols, Special Characters, Footnotes, or Math in Paper Title or Abstract. (Abstract)", "marks": [{"type": "bold"}, {"type": "italic"}]}]}, {"type": "paragraph", "content": [{"type": "text", "text": "Keywords---component, formatting, style, styling, insert (key words)", "marks": [{"type": "bold"}, {"type": "italic"}]}]}, {"type": "heading", "attrs": {"level": 2}, "content": [{"type": "text", "text": "I. INTRODUCTION"}]}, {"type": "paragraph", "content": [{"type": "text", "text": "This template, modified in MS Word 2007 and saved as a “Word 97-2003 Document” for the PC, provides authors with most of the formatting specifications needed for preparing electronic versions of their papers. All standard paper components have been specified for three reasons: (1) ease of use when formatting individual papers, (2) automatic compliance to electronic requirements that facilitate concurrent or later production of electronic products, and (3) conformity of style throughout a conference proceedings. Margins, column widths, line spacing, and type styles are built-in; examples of the type styles are provided throughout this document and are identified in italic type, within parentheses, following the example. Some components, such as multi-leveled equations, graphics, and tables are not prescribed, although the various table text styles are provided. The formatter will need to create these components, incorporating the applicable criteria that follow."}]}]}',
  'ieee-journal',
  ARRAY['Title', 'Abstract', 'Keywords', 'I. INTRODUCTION'],
  'Conference',
  5
) ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security to satisfy Supabase security recommendations
ALTER TABLE editor_templates ENABLE ROW LEVEL SECURITY;
