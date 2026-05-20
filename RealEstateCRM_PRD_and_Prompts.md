# Real Estate CRM — Complete PRD, Database Schema & Agentic AI Build Prompts

---

## PART 1: PRODUCT REQUIREMENTS DOCUMENT (PRD)

### 1.1 Product Overview

**Product Name:** Real Estate CRM (white-label, configurable per group/company)  
**Target Users:** Real estate groups, developers, brokers managing multiple property projects  
**Core Value Proposition:** A mobile-first CRM that centralizes property projects, leads, builders, and brokers — with fast lead capture (including live GPS tagging), pipeline tracking, and data export.

---

### 1.2 Design Language & Branding

| Attribute | Value |
|-----------|-------|
| Primary color | `#0D1B3E` (Deep Navy) |
| Accent color | `#C9A84C` (Gold/Amber) |
| Success/Available | `#22C55E` (Green) |
| Warning/Reserved | `#F59E0B` (Amber) |
| Info/Sold | `#3B82F6` (Blue) |
| Danger | `#EF4444` (Red) |
| Background | `#F1F5F9` (Light Gray) |
| Cards | `#FFFFFF` with subtle shadow |
| Border radius | 12–16px rounded cards |
| Typography | Clean sans-serif (e.g., DM Sans or Plus Jakarta Sans) |
| Bottom nav | Fixed 4-tab bottom nav bar (Dashboard, Projects, Contacts, Leads) |

---

### 1.3 Application Pages & Features

---

#### PAGE 1: Dashboard (Home)

**Header Banner (dark navy card):**
- Company logo + initials badge (gold background)
- "Welcome to Aakash Group" subtitle
- "Real Estate CRM" label
- Stats row: `Projects | Available Units | Sold Units`
- Download/export icon (top right)

**Overview Section (2×2 grid of stat cards):**
| Card | Icon color | Metric |
|------|-----------|--------|
| Total Projects | Navy | Count |
| Available Units | Green | Count |
| Sold Units | Gold | Count |
| Total Leads | Blue | Count |
Each card has: large number, label, `View all →` link (colored by card type)

**Quick Actions (horizontal scroll row):**
- Add Project
- Add Lead
- Add Builder
- Add Broker
- (more can be added)

**Export & Sync Banner:**
- "Export & Sync" with subtitle: "Excel · CSV · Google Sheets · Drive"
- Arrow icon to navigate

**Recent Leads Section:**
- Header: "Recent Leads" + "See All →" button
- Each lead row:
  - Avatar (initials, colored background per person)
  - Full name (bold)
  - Phone number
  - Project name (with home icon)
  - Lead source badge (Walk-in / Broker / Online / Referral)
  - Status badge (New / Contacted / Site Visit / Converted / Lost) — color coded
  - Budget (in ₹Cr / ₹L format)
  - Time since added (Today / Yesterday / Xd ago)

**Bottom Navigation Bar:**
- Dashboard | Projects | Contacts | Leads

---

#### PAGE 2: Projects List

**Header:**
- "Projects" title
- `+` button (top right) to add project

**Search bar:** "Search projects..."

**Filter tabs:** All | Active | Upcoming | Completed

**Project Card (per project):**
- Top color bar (green = Active, etc.)
- Project name (bold)
- Location + Builder name
- Progress bar: `X% sold` (navy fill + gold remaining)
- 4 stat boxes: `Total | Available (green) | Sold | Reserved (gold)`
- Price range: `₹X – ₹Y`
- `View →` button

---

#### PAGE 3: Add Project Form

**Fields:**
- Project Name* (text input)
- Location* (text input)
- Description (textarea)
- Builder (pill selector: None + all added builders)
- Price From (₹) — numeric input
- Price To (₹) — numeric input
- Status (pill selector: Active / Upcoming / Completed)
- Amenities (text input, comma-separated)

**CTA:** `Add Project` (full-width dark navy button)

---

#### PAGE 4: Project Detail View

**Content:**
- Project name + status badge
- Location + builder
- Progress bar (% sold)
- 4 stats: Total / Available / Sold / Reserved
- Price range
- Amenities list
- List of units (with status: Available / Sold / Reserved)
- Associated leads for this project

---

#### PAGE 5: Add Lead Form

**Top section:**
- Photo capture button (camera)
- Live GPS location display (auto-detected coordinates, green status indicator)

**Fields:**
- Full Name* (text)
- Phone Number* (with +91 prefix)
- Email (optional)
- Lead Source (pill: Walk-in / Broker / Online / Referral / Other)
- Budget (₹) — numeric
- Interested Project (pill: None + all projects)
- Status (pill: New / Contacted / Site Visit / Converted / Lost)
- Notes (textarea)

**CTA:** `✓ Add Lead` (full-width dark navy button)

---

#### PAGE 6: Leads List

**Header:**
- "Leads" + count + new count ("3 total · 1 new")
- `+` button

**Search bar:** "Search by name or phone..."

**Filter tabs:** All (N) | New (N) | Contacted (N) | Site Visit (N) | Converted | Lost

**Lead Row:**
- Colored left border (by status)
- Initials avatar (colored background per person)
- Name + phone + project + source badge
- Status badge + budget (right side)
- Time label

---

#### PAGE 7: Contacts — Builders

**Header:** "Contacts" + `+` button  
**Search bar:** "Search builders..."  
**Tabs:** Builders (N) | Brokers (N)

**Builder Card:**
- Initials avatar (color from brand color)
- Full name (bold)
- Company name
- Brand tagline (italic, colored)
- Phone number
- `View Brand Page →` button
- Action icons: Call (green) | Edit (gray) | Delete (red)

---

#### PAGE 8: Add Builder Form

**Brand Identity section:**
- Avatar with camera upload
- Brand Name
- Brand Tagline
- Brand Color (8 preset color swatches)
- Website URL
- Established Year

**Contact Details section:**
- Full Name*
- Company / Legal Name
- Phone Number*
- Email
- Office Address
- Notes (textarea)

**CTA:** `✓ Add Builder`

---

#### PAGE 9: Add Broker Form

**Fields:**
- Initials avatar (auto-generated from name)
- Full Name*
- Agency / Firm
- Phone Number*
- Email
- Commission Rate (e.g., 2%)
- Notes (textarea)

**CTA:** `Add Broker`

---

#### PAGE 10: Export & Sync

**Header banner (dark navy):**
- Company name
- Stats: Builders | Projects | Brokers | Leads counts
- "X total records ready to export"

**Download Excel (.xlsx) section:**
- All Data (4 sheets): Builders, Projects, Brokers & Leads
- Builders (N records)
- Projects (N records)
- Brokers (N records)
- Leads (N records)
Each row has a download icon button

*(Future: CSV export, Google Sheets sync, Google Drive sync)*

---

### 1.4 Non-Functional Requirements

- Mobile-first design (375px+ screens), works on desktop too
- Offline-capable data entry (leads captured offline, synced when online) — optional v2
- All monetary values displayed in Indian format: ₹Cr / ₹L / ₹
- GPS coordinates captured at lead creation time
- Data persists across sessions (use localStorage or backend DB)
- Export functionality generates downloadable Excel files

---

## PART 2: DATABASE SCHEMA

### Technology Stack Recommendation

| Layer | Recommendation |
|-------|---------------|
| Frontend | Nex.js with React + Tailwind CSS |
| Backend | Next.js API routes |
| Database | Supabase for rapid dev (PostgreSQL using SQL Editor) |
| Auth | next-auth for one user login only. |
| Storage | Supabase Storage (for photos) OR cloudinary (later part) |
| Export | SheetJS (xlsx) on frontend |
| GPS Tracking - use appropriate module. |
---

### 2.1 Schema (PostgreSQL) with Supabase

```sql
-- =====================
-- COMPANIES (multi-tenant root)
-- =====================
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  initials VARCHAR(5),
  logo_url TEXT,
  brand_color VARCHAR(7) DEFAULT '#0D1B3E',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- BUILDERS
-- =====================
CREATE TABLE builders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  company_name VARCHAR(255),
  legal_name VARCHAR(255),
  brand_tagline TEXT,
  brand_color VARCHAR(7) DEFAULT '#0D1B3E',
  logo_url TEXT,
  website VARCHAR(255),
  established_year INT,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  office_address TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- BROKERS
-- =====================
CREATE TABLE brokers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  agency_firm VARCHAR(255),
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  commission_rate DECIMAL(5,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- PROJECTS
-- =====================
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  builder_id UUID REFERENCES builders(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(500) NOT NULL,
  description TEXT,
  price_from BIGINT,
  price_to BIGINT,
  status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Upcoming', 'Completed')),
  amenities TEXT[], -- array of amenity strings
  total_units INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- UNITS (individual flats/plots per project)
-- =====================
CREATE TABLE units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  unit_number VARCHAR(50),
  floor INT,
  area_sqft DECIMAL(10,2),
  price BIGINT,
  status VARCHAR(20) DEFAULT 'Available' CHECK (status IN ('Available', 'Sold', 'Reserved')),
  buyer_lead_id UUID, -- references leads
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- LEADS
-- =====================
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  lead_source VARCHAR(20) DEFAULT 'Walk-in' CHECK (lead_source IN ('Walk-in', 'Broker', 'Online', 'Referral', 'Other')),
  broker_id UUID REFERENCES brokers(id) ON DELETE SET NULL,
  budget BIGINT,
  interested_project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'New' CHECK (status IN ('New', 'Contacted', 'Site Visit', 'Converted', 'Lost')),
  notes TEXT,
  photo_url TEXT,
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  location_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- LEAD FOLLOW-UPS / ACTIVITY LOG
-- =====================
CREATE TABLE lead_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  activity_type VARCHAR(50), -- 'Call', 'Site Visit', 'WhatsApp', 'Email', 'Status Change'
  description TEXT,
  old_status VARCHAR(20),
  new_status VARCHAR(20),
  created_by VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- USEFUL VIEWS
-- =====================

-- Project stats view (computed available/sold/reserved)
CREATE VIEW project_stats AS
SELECT 
  p.id,
  p.name,
  p.status,
  p.total_units,
  COUNT(u.id) FILTER (WHERE u.status = 'Available') AS available_units,
  COUNT(u.id) FILTER (WHERE u.status = 'Sold') AS sold_units,
  COUNT(u.id) FILTER (WHERE u.status = 'Reserved') AS reserved_units,
  ROUND(COUNT(u.id) FILTER (WHERE u.status = 'Sold') * 100.0 / NULLIF(p.total_units, 0), 0) AS percent_sold
FROM projects p
LEFT JOIN units u ON u.project_id = p.id
GROUP BY p.id, p.name, p.status, p.total_units;

-- Dashboard summary view
CREATE VIEW dashboard_summary AS
SELECT 
  company_id,
  (SELECT COUNT(*) FROM projects WHERE company_id = c.id) AS total_projects,
  (SELECT SUM(available_units) FROM project_stats ps JOIN projects pr ON ps.id = pr.id WHERE pr.company_id = c.id) AS available_units,
  (SELECT SUM(sold_units) FROM project_stats ps JOIN projects pr ON ps.id = pr.id WHERE pr.company_id = c.id) AS sold_units,
  (SELECT COUNT(*) FROM leads WHERE company_id = c.id) AS total_leads
FROM companies c;
```

---

### 2.2 Supabase-Specific Setup 

```sql
-- Enable Row Level Security
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE builders ENABLE ROW LEVEL SECURITY;
ALTER TABLE brokers ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;

-- Storage bucket for lead photos and builder logos
-- Create via Supabase dashboard: bucket name = 'crm-media', public = false
```

---

### 2.3 Supabase ENV Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

---

## PART 3: AGENTIC AI BUILD PROMPTS

Use these prompts sequentially with your agentic AI (Claude Code, Cursor, v0, Lovable, etc.).

---

### PROMPT 0 — PROJECT SETUP

```
Create a new Next.js 14 (App Router) project called "realestate-crm" with the following stack:
- Next.js 14 with App Router and Javascript
- Tailwind CSS for styling
- Supabase for database and next-auth for auth (install @supabase/supabase-js)
- SheetJS (xlsx) for Excel export
- lucide-react for icons
- date-fns for date formatting

Project structure:
/app
  /dashboard (page.jsx)
  /projects (page.jsx, /add/page.jsx, /[id]/page.jsx)
  /contacts (page.jsx, /add-builder/page.jsx, /add-broker/page.jsx)
  /leads (page.jsx, /add/page.jsx)
  /export (page.jsx)
/components
  /ui (Button, Card, Badge, Input, Modal, BottomNav)
  /dashboard (StatCard, RecentLeadRow, QuickAction)
  /projects (ProjectCard, AddProjectForm)
  /leads (LeadCard, AddLeadForm)
  /contacts (BuilderCard, BrokerCard)
/lib
  /supabase.js
  /utils.js (formatPrice, formatDate, getInitials)


Initialize with Supabase client. Use the following color tokens in tailwind.config.js:
- navy: #0D1B3E
- gold: #C9A84C
- success: #22C55E
- warning: #F59E0B
- info: #3B82F6
- surface: #F1F5F9
```

---

### PROMPT 1 — SUPABASE SETUP and required Utils

```

In /lib/supabase.js, create the Supabase client using createClientComponentClient from @supabase/auth-helpers-nextjs.

Create /lib/utils.js with:
- formatPrice(amount: number): string — converts raw number to "₹2.5Cr" or "₹70.0L" format
- getInitials(name: string): string — "Ravi Kumar" → "RK"
- getAvatarColor(name: string): string — deterministic color from name
- formatRelativeTime(date: string): string — "Today", "Yesterday", "2d ago"
- formatPriceRange(from?: number, to?: number): string — "₹85.0L – ₹1.5Cr"
```

---

### PROMPT 2 — SHARED UI COMPONENTS

```
Build these reusable components in /components/ui/:

1. BottomNav.jsx — Fixed bottom navigation bar with 4 tabs:
   - Dashboard (bar chart icon), Projects (grid icon), Contacts (people icon), Leads (person+ icon)
   - Active tab: navy color, inactive: gray
   - Use Next.js Link for navigation
   - Fixed at bottom, full width, white background, subtle top border

2. Button.jsx — Variants: primary (navy bg, white text), outline, ghost, danger
   Full-width option. Rounded-xl. Loading spinner state.

3. Card.jsx — White background, rounded-2xl, shadow-sm. Optional colored top border (4px).

4. Badge.jsx — Small pill badges for:
   - Status: New (blue), Contacted (gold), Site Visit (purple), Converted (green), Lost (red)
   - Lead Source: Walk-in, Broker, Online, Referral, Other
   Appropriate background/text color per variant.

5. Input.jsx — Styled text input with label, placeholder, error state. Rounded-xl, gray bg.

6. PageHeader.jsx — Page title (bold, large) + optional right-side action button (+).

7. StatCard.jsx — Card showing: icon, large number, label, "View all →" link. Accept: count, label, icon, accentColor, href.

8. Avatar.jsx — Circular initials avatar. Accept: name, size, bgColor (auto from name if not provided).
```

---

### PROMPT 3 — DASHBOARD PAGE

```
Build /app/dashboard/page.jsx — the main home screen.

Layout (mobile-first, max-width 480px centered, works on desktop):

SECTION 1 — Header Banner (dark navy #0D1B3E, rounded-2xl):
- Left: Company initials badge (gold bg, navy text) + "Welcome to" + Company Name (large, gold) + "Real Estate CRM"
- Right: Download icon button
- Stats row below a divider: [Projects count] | [Available count] | [Sold count]
- Fetch these from Supabase: count of projects, sum of available_units, sum of sold_units from project_stats view

SECTION 2 — Overview (2×2 grid):
Four StatCards:
- Total Projects (grid icon, navy) — count from projects table
- Available Units (home icon, green) — sum from project_stats
- Sold Units (check icon, gold) — sum from project_stats  
- Total Leads (person+ icon, blue) — count from leads table

SECTION 3 — Quick Actions (horizontal scroll):
Cards with icon + label: Add Project, Add Lead, Add Builder, Add Broker
Each navigates to respective /add route on click.

SECTION 4 — Export & Sync Banner:
White card, cloud icon, "Export & Sync" title, "Excel · CSV · Google Sheets · Drive" subtitle, right arrow
Navigate to /export on click.

SECTION 5 — Recent Leads (last 5 leads, sorted by created_at DESC):
Header "Recent Leads" + "See All →" link
Each lead row: Avatar | Name + Phone + Project + Source badge | Status badge + Budget | Time
Fetch with JOIN on projects table.

Use Supabase for all data. Show loading skeletons. Add bottom padding for nav bar.
```

---

### PROMPT 4 — PROJECTS PAGE + ADD PROJECT

```
Build /app/projects/page.jsx:

HEADER: "Projects" title + navy "+" button → navigate to /projects/add

SEARCH: Input with search icon, filters projects by name/location in real-time

FILTER TABS: All | Active | Upcoming | Completed (pill buttons, active = navy)

PROJECT CARDS (fetch from Supabase with builder JOIN and unit stats):
Each card:
- Top colored border: green (Active), blue (Upcoming), gray (Completed)
- Project name (bold) + status badge (top right)
- Location (pin icon) + Builder name
- Progress bar: navy fill for % sold, gold for remaining — label "X% sold"
- 4 stat boxes in a 2×2 grid: Total (gray), Available (green bg), Sold (gray), Reserved (gold bg)
- Price range in gold: ₹X – ₹Y
- "View →" button (bottom right)

---

Build /app/projects/add/page.jsx:

Back arrow + "Add Project" title

FORM FIELDS (all with styled inputs):
- Project Name* 
- Location*
- Description (textarea, 3 rows)
- Builder (horizontal pill selector — fetch all builders, show "None" + each builder name)
- Price From (₹) and Price To (₹) side by side
- Status (pill: Active / Upcoming / Completed, default Active)
- Amenities (text input, hint: "e.g. Gym, Pool, Parking")

SUBMIT: Full-width navy button "Add Project"
On submit: INSERT into projects table, navigate back to /projects

Also build /app/projects/[id]/page.jsx showing full project detail with all stats and a list of leads interested in this project.
```

---

### PROMPT 5 — LEADS PAGE + ADD LEAD

```
Build /app/leads/page.jsx:

HEADER: "Leads" + subtitle "X total · Y new" + "+" button

SEARCH: "Search by name or phone..."

FILTER TABS (pill, with counts): All (N) | New (N) | Contacted (N) | Site Visit (N) | Converted | Lost

LEAD LIST (fetch from Supabase with project JOIN, sorted by created_at DESC):
Each lead row (white card, left border colored by status):
- Left colored bar: New=blue, Contacted=gold, Site Visit=purple, Converted=green, Lost=red
- Avatar (initials, deterministic color)
- Name (bold) + phone + project name (home icon) + source badge
- Right: status badge + budget (gold, formatted) + time label
- Tap entire row → navigate to lead detail page

---

Build /app/leads/add/page.jsx:

"Add Lead" header with back arrow

TOP CARD (white, rounded):
- Camera icon button ("Take Photo") — left
- "Live Location" with pin icon — right
- Show current GPS coordinates (use navigator.geolocation API)
- Green status dot + coordinates text when GPS acquired

FORM:
- Full Name* (text)
- Phone Number* (prefilled with "+91 ")
- Email (optional)
- Lead Source pills: Walk-in (default) | Broker | Online | Referral | Other
- Budget (₹) — numeric input
- Interested Project pills: None (default) + fetch all projects
- Status pills: New (default) | Contacted | Site Visit | Converted | Lost
- Notes (textarea)

SUBMIT: "✓ Add Lead" full-width navy button

On submit: INSERT lead into Supabase with GPS coordinates, navigate to /leads
```

---

### PROMPT 6 — CONTACTS PAGE (Builders + Brokers)

```
Build /app/contacts/page.jsx:

HEADER: "Contacts" + "+" button (opens choice: Add Builder or Add Broker)

SEARCH: "Search builders..." (updates based on active tab)

TABS: Builders (N) | Brokers (N) — toggle between two lists

BUILDERS LIST:
Each builder card (white, rounded-2xl):
- Left colored border (builder's brand_color)
- Avatar: initials in brand_color background
- Full name (bold)
- Company name
- Tagline (italic, brand_color)
- Phone (phone icon)
- "View Brand Page →" button
- Right: Call icon (green), Edit icon (gray), Delete icon (red)

BROKERS LIST:
Each broker card:
- Avatar (initials, gold tint)
- Full name (bold)
- Agency/Firm
- Phone
- Commission rate badge
- Call + Edit + Delete icons

---

Build /app/contacts/add-builder/page.jsx:

"Add Builder" + back arrow

BRAND IDENTITY SECTION:
- Large avatar (circle) with camera icon — shows initials, click to upload
- Brand Name (text)
- Brand Tagline (text)
- Brand Color (8 color swatches: navy, blue, purple, red, orange, green, teal, pink, gray — selectable)
- Website URL
- Established Year

CONTACT DETAILS SECTION:
- Full Name*
- Company / Legal Name
- Phone Number*
- Email
- Office Address
- Notes (textarea)

"✓ Add Builder" navy button — INSERT to builders table

---

Build /app/contacts/add-broker/page.jsx:

"Add Broker" + back arrow

- Auto-generated initials avatar (gold tint, updates as name is typed)
- Full Name*
- Agency / Firm
- Phone Number*
- Email
- Commission Rate (e.g., "2%")
- Notes

"Add Broker" navy button — INSERT to brokers table
```

---

### PROMPT 7 — EXPORT & SYNC PAGE

```
Build /app/export/page.jsx:

HEADER: "Export & Sync" + back arrow

BANNER (dark navy card, rounded-2xl):
- "AAKARSH GROUP" (gold, uppercase, bold) — company name
- "Data Export & Sync" subtitle
- 4 stats in a row: Builders | Projects | Brokers | Leads (count each)
- "X total records ready to export" centered text

DOWNLOAD EXCEL SECTION:
Install and use SheetJS (xlsx package).

List items with download icon button (right):
1. "All Data (4 sheets)" — subtitle: "Builders, Projects, Brokers & Leads"
2. "Builders" — "N records"
3. "Projects" — "N records"
4. "Brokers" — "N records"
5. "Leads" — "N records"

Each download button:
- Fetches relevant data from Supabase
- Generates .xlsx using SheetJS (XLSX.utils.json_to_sheet + XLSX.writeFile)
- "All Data" creates a workbook with 4 sheets

For "All Data": 
- Sheet 1: Builders (all columns)
- Sheet 2: Projects (all columns + builder name)
- Sheet 3: Brokers (all columns)
- Sheet 4: Leads (all columns + project name, formatted budget)

Each icon button shows a loading spinner while downloading.
```

---

### PROMPT 8 — SEED DATA + FINAL POLISH

```
1. Create /lib/seed.ts with sample data matching the screenshots:

Companies: { name: 'Aakarsh Group', initials: 'AG', brand_color: '#C9A84C' }

Builders:
- Rajesh Mehta, Mehta Constructions, tagline: "Building Dreams, Delivering Excellence", navy
- Suresh Patel, Patel Developers Pvt Ltd, tagline: "Homes That Inspire, Prices That Surprise", purple

Projects:
- Mehta Residency, Andheri West Mumbai, Active, ₹85L-1.5Cr, 40 units (22 available, 15 sold, 3 reserved)
- Patel Heights, Thane Maharashtra, Active, ₹45L-80L, 60 units (30 available, 28 sold, 2 reserved)
- Sunrise Villas, Active (third project)

Leads:
- Ravi Kumar, +91 77665 44332, Sunrise Villas, Walk-in, ₹2.5Cr, New
- Neha Joshi, +91 88776 55443, Patel Heights, Broker, ₹70L, Contacted
- Vikram Sharma, +91 99001 12233, Mehta Residency, Online, ₹1Cr, Site Visit

2. Add global layout with bottom nav padding (pb-20) on all pages

3. Add loading skeleton components for all list pages

4. Add empty states (illustration + message) when no data

5. Add toast notifications for: "Lead added successfully", "Project created", "Builder saved"

6. Add confirmation dialog before delete operations

7. On the dashboard, clicking each stat card navigates to the filtered view

8. Make all monetary amounts display in Indian format using formatPrice util

9. Add a simple settings/profile page accessible from dashboard header

10. Ensure all forms have proper validation with error messages shown below fields
```

### PROMPT 8 — Backend API routes so each functionality works
```
1. For each of the above functonalities discussed, make each required API route for covering the workflow and each function to work-out.


---

## PART 4: TECHNOLOGY DECISIONS CHEATSHEET

| Decision | Choice | Why |
|----------|--------|-----|
| Framework | Next.js 14 (App Router) | SSR, routing, API routes all-in-one |
| Database | Supabase (PostgreSQL) | Instant REST API, auth, storage, realtime |
| Styling | Tailwind CSS | Fast, consistent, responsive |
| Icons | lucide-react | Matches the clean icon style in screenshots |
| Excel Export | SheetJS (xlsx) | Client-side, no backend needed |
| GPS | browser navigator.geolocation | Native, no API key needed |
| Photo Upload | Supabase Storage | Simple bucket upload |
| Date Formatting | date-fns | Lightweight, "Today / Yesterday / Xd ago" |
| State | React useState + Supabase queries | Simple, no Redux needed for this scale |

---

## PART 5: QUICK START COMMANDS

```bash
# 1. Create project
npx create-next-app@latest realestate-crm --tailwind --app

# 2. Install dependencies
cd realestate-crm
npm install @supabase/supabase-js next-auth
npm install lucide-react date-fns xlsx
npm install clsx tailwind-merge

# 3. Set up Supabase
# - Create project at supabase.com
# - Run the SQL schema from Part 2 in SQL Editor
# - Copy API keys to .env.local

# 4. Run seed data (optional)
npx ts-node lib/seed.ts

# 5. Start dev server
npm run dev
```

---

*Document generated based on UI analysis of Aakarsh Group Real Estate CRM screenshots.*
*All screen flows, data models, and component specs are reverse-engineered from the provided images.*