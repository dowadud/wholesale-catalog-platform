# System Architecture

## Overview Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        CUSTOMERS                             │
│                    (Public Access)                           │
│                                                              │
│  📱 Mobile Browsers          💻 Desktop Browsers            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ HTTPS
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    VERCEL CDN (Free Tier)                    │
│              Global Edge Network + Caching                   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  NEXT.JS APPLICATION                         │
│                   (Vercel Hosting)                           │
│                                                              │
│  PUBLIC PAGES          │          ADMIN PAGES                │
│  ├─ / (Landing)        │          ├─ /admin (Login)         │
│  ├─ /catalogs          │          ├─ /admin/dashboard       │
│  ├─ /order             │          ├─ /admin/upload          │
│  └─ /thank-you         │          ├─ /admin/catalogs        │
│                        │          └─ /admin/orders           │
│                        │                                     │
│  API ROUTES                                                  │
│  └─ /api/orders (POST) ─────────────┐                       │
└────────────────┬────────────────────┼───────────────────────┘
                 │                     │
                 │                     │
    ┌────────────▼─────────┐          │
    │  SUPABASE (Free)     │          │
    │                      │          │
    │  ┌────────────────┐ │          │
    │  │   PostgreSQL   │ │          │
    │  │   Database     │ │          │
    │  │                │ │          │
    │  │  📊 catalogs   │ │          │
    │  │  📊 orders     │ │          │
    │  └────────────────┘ │          │
    │                      │          │
    │  ┌────────────────┐ │          │
    │  │  Supabase Auth │ │          │
    │  │  🔐 Admin      │ │          │
    │  │     Users      │ │          │
    │  └────────────────┘ │          │
    │                      │          │
    │  ┌────────────────┐ │          │
    │  │ Storage Bucket │ │          │
    │  │  📄 PDF Files  │ │          │
    │  └────────────────┘ │          │
    └──────────────────────┘          │
                                      │
                                      │
                          ┌───────────▼──────────┐
                          │  RESEND (Free)       │
                          │  Email Delivery      │
                          │                      │
                          │  ✉️  Order          │
                          │     Notifications    │
                          │     to Admin         │
                          └──────────────────────┘
```

## Data Flow

### 1. Customer Places Order

```
Customer → Order Form → /api/orders → Supabase DB → Resend → Admin Email
                                    ↓
                              Thank You Page
```

**Steps:**
1. Customer fills out order form
2. Form submits to API route
3. API validates data
4. Order saved to database
5. Email sent to admin
6. Customer redirected to thank you page

### 2. Admin Uploads Catalog

```
Admin → Login → Dashboard → Upload Page → Supabase Storage → Database
                                                            ↓
                                                    Public Catalogs Page
```

**Steps:**
1. Admin logs in with Supabase Auth
2. Navigates to upload page
3. Selects PDF file + enters metadata
4. File uploads to Supabase Storage
5. File URL stored in database
6. Catalog immediately visible to public

### 3. Customer Views Catalog

```
Customer → Catalogs Page → Supabase DB Query → PDF URLs → Browser PDF Viewer
```

**Steps:**
1. Customer visits catalogs page
2. App queries Supabase for all catalogs
3. Displays catalog cards
4. Customer clicks to view
5. PDF opens in modal/iframe

## Component Architecture

```
app/
├── layout.tsx (Root Layout)
│   └── globals.css (Tailwind Styles)
│
├── page.tsx (Landing Page)
│   └── Links to /catalogs and /order
│
├── catalogs/
│   └── page.tsx (Catalog Viewer)
│       ├── Fetches catalogs from Supabase
│       ├── Displays catalog cards
│       └── PDF modal viewer
│
├── order/
│   └── page.tsx (Order Form)
│       ├── Customer info inputs
│       ├── Dynamic item rows
│       ├── Add/Remove items
│       └── Submits to /api/orders
│
├── thank-you/
│   └── page.tsx (Confirmation)
│       └── Simple success message
│
├── admin/
│   ├── page.tsx (Login)
│   │   └── Supabase Auth sign in
│   │
│   ├── dashboard/
│   │   └── page.tsx (Dashboard)
│   │       ├── Stats display
│   │       └── Quick action links
│   │
│   ├── upload/
│   │   └── page.tsx (Upload Form)
│   │       ├── File picker
│   │       ├── Metadata inputs
│   │       └── Supabase Storage upload
│   │
│   ├── catalogs/
│   │   └── page.tsx (Manage Catalogs)
│   │       ├── List all catalogs
│   │       └── Delete functionality
│   │
│   └── orders/
│       └── page.tsx (View Orders)
│           ├── Paginated order list
│           ├── Expandable details
│           └── CSV export
│
└── api/
    └── orders/
        └── route.ts (Order API)
            ├── Validates order data
            ├── Inserts to database
            └── Triggers email
```

## Database Schema

```sql
┌─────────────────────────┐
│       catalogs          │
├─────────────────────────┤
│ id (uuid) PK            │
│ title (text)            │
│ file_url (text)         │
│ category (text)         │
│ created_at (timestamp)  │
└─────────────────────────┘

┌─────────────────────────┐
│        orders           │
├─────────────────────────┤
│ id (uuid) PK            │
│ customer_name (text)    │
│ email (text)            │
│ phone (text)            │
│ business_name (text)    │
│ items (jsonb)           │
│ created_at (timestamp)  │
└─────────────────────────┘
    │
    └─ items structure:
       [
         {
           reference_number: string,
           quantity: number,
           notes: string (optional)
         }
       ]
```

## Security Architecture

```
┌─────────────────────────────────────────────┐
│             Security Layers                  │
├─────────────────────────────────────────────┤
│                                             │
│  1. HTTPS (Vercel Default)                  │
│     └─ All traffic encrypted                │
│                                             │
│  2. Environment Variables                   │
│     └─ Secrets never in code                │
│                                             │
│  3. Row Level Security (RLS)                │
│     ├─ Catalogs:                            │
│     │  ├─ Read: Public ✅                   │
│     │  └─ Write: Auth only 🔒               │
│     └─ Orders:                              │
│        ├─ Create: Public ✅                 │
│        └─ Read: Auth only 🔒                │
│                                             │
│  4. Storage Policies                        │
│     ├─ Read PDFs: Public ✅                 │
│     └─ Upload/Delete: Auth only 🔒          │
│                                             │
│  5. Admin Routes                            │
│     └─ Check session on page load           │
│                                             │
│  6. API Validation                          │
│     └─ Input validation & sanitization      │
│                                             │
└─────────────────────────────────────────────┘
```

## Authentication Flow

```
Admin Login Attempt
        │
        ▼
┌─────────────────┐
│ Email/Password  │
└────────┬────────┘
         │
         ▼
┌──────────────────────┐
│  Supabase Auth       │
│  Validates           │
└─────────┬────────────┘
          │
    ┌─────┴─────┐
    │           │
    ▼           ▼
  ❌ Invalid   ✅ Valid
  Show Error   Create Session
               │
               ▼
          Store in Cookie
               │
               ▼
          Redirect to
          /admin/dashboard
               │
               ▼
     ┌──────────────────┐
     │ Protected Pages  │
     │ Check Session    │
     │ on Load          │
     └──────────────────┘
```

## File Upload Flow

```
Admin Selects PDF
        │
        ▼
┌──────────────────┐
│ Validate File    │
│ - Type: PDF      │
│ - Size: OK       │
└────────┬─────────┘
         │
         ▼
┌──────────────────────┐
│ Upload to Supabase   │
│ Storage Bucket       │
│ catalogs/[timestamp] │
└─────────┬────────────┘
          │
          ▼
┌──────────────────────┐
│ Get Public URL       │
└─────────┬────────────┘
          │
          ▼
┌──────────────────────┐
│ Save to Database     │
│ - title              │
│ - file_url           │
│ - category           │
└─────────┬────────────┘
          │
          ▼
    ✅ Success
    Redirect to
    Catalog Management
```

## Email Notification Flow

```
Order Submitted
        │
        ▼
┌──────────────────┐
│ Order Saved to   │
│ Database         │
└────────┬─────────┘
         │
         ▼
┌──────────────────────┐
│ Format Email Body    │
│ - Customer info      │
│ - Order items        │
│ - Timestamp          │
└─────────┬────────────┘
          │
          ▼
┌──────────────────────┐
│ Send via Resend API  │
│ - from: orders@...   │
│ - to: admin@...      │
└─────────┬────────────┘
          │
    ┌─────┴─────┐
    │           │
    ▼           ▼
  ❌ Fails    ✅ Success
  Log Error   Admin Notified
  Continue    (Don't fail order)
```

## Technology Stack Details

```
┌─────────────────────────────────────────────┐
│              FRONTEND                        │
├─────────────────────────────────────────────┤
│ Next.js 14 (React 18)                       │
│ ├─ App Router (latest)                      │
│ ├─ Server Components                        │
│ ├─ Client Components ('use client')         │
│ └─ API Routes                               │
│                                             │
│ TypeScript 5.3                              │
│ └─ Full type safety                         │
│                                             │
│ Tailwind CSS 3.4                            │
│ └─ Utility-first styling                    │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│              BACKEND                         │
├─────────────────────────────────────────────┤
│ Supabase (Open Source Firebase)             │
│ ├─ PostgreSQL 15                            │
│ ├─ PostgREST API                            │
│ ├─ GoTrue Auth                              │
│ └─ Storage (S3-compatible)                  │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│            INFRASTRUCTURE                    │
├─────────────────────────────────────────────┤
│ Vercel                                      │
│ ├─ Serverless Functions                    │
│ ├─ Edge Network (CDN)                      │
│ ├─ Auto SSL                                │
│ └─ Git Integration                         │
│                                             │
│ Resend                                      │
│ └─ Transactional Email API                 │
└─────────────────────────────────────────────┘
```

## Performance Optimizations

```
┌─────────────────────────────────────────────┐
│         OPTIMIZATION STRATEGIES              │
├─────────────────────────────────────────────┤
│                                             │
│ 1. Static Generation                        │
│    └─ Landing page pre-rendered             │
│                                             │
│ 2. Database Indexes                         │
│    ├─ created_at (for sorting)              │
│    └─ email (for lookups)                   │
│                                             │
│ 3. CDN Caching                              │
│    └─ Vercel Edge Network                   │
│                                             │
│ 4. Lazy Loading                             │
│    └─ PDF viewer loads on demand            │
│                                             │
│ 5. Pagination                               │
│    └─ Orders displayed 10 at a time         │
│                                             │
│ 6. Connection Pooling                       │
│    └─ Supabase handles automatically        │
│                                             │
└─────────────────────────────────────────────┘
```

## Scalability Considerations

### Current Capacity (Free Tier)
- **Concurrent Users**: 100+
- **Orders/Day**: 100 (email limit)
- **Total Orders**: 10,000+ (database)
- **PDF Storage**: 20-100 catalogs
- **Bandwidth**: 100GB/month

### Scaling Path
1. **More Traffic** → Upgrade Vercel ($20/mo)
2. **More Storage** → Upgrade Supabase ($25/mo)
3. **More Emails** → Upgrade Resend ($20/mo)

### Architecture Benefits
- ✅ Serverless (auto-scales)
- ✅ Stateless (no sessions to manage)
- ✅ CDN distribution (global)
- ✅ Database connection pooling
- ✅ No server maintenance

## Deployment Pipeline

```
Local Development
        │
        ▼
    Git Commit
        │
        ▼
    Push to GitHub
        │
        ▼
┌──────────────────┐
│ Vercel Webhook   │
│ Triggered        │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Build Process    │
│ - npm install    │
│ - next build     │
│ - Run tests      │
└────────┬─────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
  ❌ Fail   ✅ Success
  Notify    │
            ▼
      ┌─────────────┐
      │ Deploy to   │
      │ Production  │
      └──────┬──────┘
             │
             ▼
      Global CDN Update
             │
             ▼
      ✅ Live in 2-3 min
```

## Monitoring & Observability

### What to Monitor

1. **Vercel Dashboard**
   - Deployment status
   - Function execution time
   - Bandwidth usage
   - Error logs

2. **Supabase Dashboard**
   - Database size
   - Storage usage
   - Active connections
   - Slow queries

3. **Resend Dashboard**
   - Email delivery rate
   - Bounce rate
   - Daily quota usage

### Logging Strategy
- API errors logged to console
- Supabase logs available in dashboard
- Vercel logs available per deployment

---

## Summary

This is a **modern, scalable, serverless architecture** that:

✅ Costs $0/month on free tier  
✅ Handles thousands of users  
✅ Scales automatically  
✅ Requires no server maintenance  
✅ Provides global performance  
✅ Includes built-in security  
✅ Offers easy monitoring  

**Perfect for a wholesale catalog business!**

