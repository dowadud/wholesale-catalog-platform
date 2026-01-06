# Wholesale Catalog Ordering Platform

A complete web-based catalog ordering system built with **100% free tools**. Upload PDF catalogs, allow customers to place orders, and manage everything through an admin dashboard.

## 🚀 Live Demo

**Public Site**: [Your Vercel URL here after deployment]  
**Admin Dashboard**: [Your Vercel URL]/admin

## 🛠️ Tech Stack (All Free Tier)

- **Frontend**: Next.js 14 + Tailwind CSS
- **Hosting**: Vercel (Free Tier)
- **Database**: Supabase (Free Tier)
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage
- **PDF Viewer**: Browser native (iframe) + PDF.js ready
- **Email**: Resend (Free Tier - 100 emails/day)

## ✨ Features

### Public Features
- 🏠 Clean, minimalist landing page
- 📚 Catalog browsing page with all uploaded PDFs
- 📄 Full-screen PDF viewer (mobile responsive)
- 📝 Dynamic order form with unlimited line items
- ✅ Order confirmation page
- 📱 Fully responsive design

### Admin Features (Protected)
- 🔐 Secure authentication with Supabase Auth
- 📊 Dashboard with statistics
- ⬆️ Upload PDF catalogs with title and category
- 🗑️ Delete catalogs
- 📋 View all orders with pagination
- 📊 Export orders to CSV
- 📧 Automatic email notifications on new orders

## 📋 Prerequisites

Before deploying, you'll need:

1. **GitHub Account** (free)
2. **Vercel Account** (free) - Sign up at [vercel.com](https://vercel.com)
3. **Supabase Account** (free) - Sign up at [supabase.com](https://supabase.com)
4. **Resend Account** (free) - Sign up at [resend.com](https://resend.com)

## 🚀 Deployment Instructions

### Step 1: Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for your project to finish setting up (2-3 minutes)
3. Go to **SQL Editor** in the left sidebar
4. Copy the contents of `supabase/schema.sql` and paste it into the SQL Editor
5. Click **Run** to create all tables and policies
6. Go to **Settings** > **API** and copy:
   - Project URL (e.g., `https://xxxxx.supabase.co`)
   - `anon public` key
   - `service_role` key (keep this secret!)

### Step 2: Create Admin User

1. In Supabase, go to **Authentication** > **Users**
2. Click **Add User** > **Create new user**
3. Enter your admin email and password
4. Save these credentials - you'll use them to log into the admin dashboard

### Step 3: Set Up Resend for Emails

1. Go to [resend.com](https://resend.com) and sign up
2. Go to **API Keys** and create a new API key
3. Copy the API key (starts with `re_`)
4. (Optional) Add and verify your domain for production emails
   - For testing, you can use their default domain

### Step 4: Deploy to Vercel

1. Push this code to your GitHub repository:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

2. Go to [vercel.com](https://vercel.com) and click **New Project**
3. Import your GitHub repository
4. Configure Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL` = Your Supabase Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Your Supabase anon key
   - `SUPABASE_SERVICE_ROLE_KEY` = Your Supabase service role key
   - `RESEND_API_KEY` = Your Resend API key
5. Click **Deploy**
6. Wait 2-3 minutes for deployment to complete
7. Your site is now live!

### Step 5: Configure Email Addresses

1. Open `app/api/orders/route.ts`
2. Update the email addresses on lines 70-71:
   - `from`: Use your verified Resend domain email
   - `to`: Use your admin email where you want to receive orders
3. Commit and push changes - Vercel will auto-deploy

## 📱 Usage Instructions

### For Customers

1. Visit your site homepage
2. Click **"View Catalogs"** to browse PDF catalogs
3. Click on any catalog to view it full-screen
4. Click **"Place an Order"** to submit an order
5. Fill in contact information
6. Add order items with reference numbers and quantities
7. Click **"Add Item"** to add more products
8. Submit the order
9. Receive confirmation on the thank you page

### For Admins

#### Logging In

1. Go to `yoursite.com/admin`
2. Enter your admin email and password (created in Step 2)
3. Click **Sign In**

#### Uploading Catalogs

1. From the dashboard, click **"Upload Catalog"**
2. Enter a catalog title (e.g., "Spring 2025 Collection")
3. (Optional) Enter a category (e.g., "Apparel", "Electronics")
4. Select your PDF file
5. Click **"Upload Catalog"**
6. The catalog is now visible on the public catalog page

#### Managing Catalogs

1. From the dashboard, click **"Manage Catalogs"**
2. View all uploaded catalogs
3. Click **"View"** to preview a catalog
4. Click **"Delete"** to remove a catalog (this also deletes the file)

#### Viewing Orders

1. From the dashboard, click **"View Orders"**
2. See all orders sorted by date (newest first)
3. Click on any order to expand and see full details
4. Use pagination to navigate through orders
5. Click **"Export to CSV"** to download all orders

#### Exporting Orders

The CSV export includes:
- Order ID
- Customer Name
- Email
- Phone
- Business Name
- Items (JSON format)
- Order Date

You can open this in Excel, Google Sheets, or any spreadsheet application.

## 🔧 Maintenance

### Adding More Admin Users

1. Log into Supabase
2. Go to **Authentication** > **Users**
3. Click **Add User** > **Create new user**
4. Provide the new admin with their credentials

### Checking Storage Usage

1. Supabase free tier includes **1GB storage**
2. Monitor usage: Supabase Dashboard > **Storage** > **catalogs** bucket
3. Each PDF typically ranges from 1-50MB

### Monitoring Email Usage

1. Resend free tier: **100 emails/day**
2. Check usage: Resend Dashboard > **API Keys** > View usage
3. Each order generates 1 email

### Updating Styles

- Main colors and styles: `app/globals.css`
- Tailwind configuration: `tailwind.config.js`
- All pages use consistent styling with charcoal text on white background

## 📊 Database Schema

### Catalogs Table
```sql
- id (uuid, primary key)
- title (text)
- file_url (text)
- category (text, optional)
- created_at (timestamp)
```

### Orders Table
```sql
- id (uuid, primary key)
- customer_name (text)
- email (text)
- phone (text)
- business_name (text)
- items (jsonb) - array of {reference_number, quantity, notes}
- created_at (timestamp)
```

## 🔐 Security

- Admin routes protected by Supabase Auth
- Row Level Security (RLS) enabled on all tables
- Storage bucket policies prevent unauthorized deletions
- Environment variables keep sensitive keys secure
- No API keys exposed to the client

## 📈 Scaling & Limits

### Vercel Free Tier
- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ Serverless function execution

### Supabase Free Tier
- ✅ 500MB database space
- ✅ 1GB file storage
- ✅ 50,000 monthly active users
- ✅ 2GB bandwidth

### Resend Free Tier
- ✅ 100 emails/day
- ✅ 3,000 emails/month

## 🐛 Troubleshooting

### Can't upload PDFs
- Check Supabase Storage bucket is created
- Verify storage policies are set correctly
- Check file size (Supabase free tier has limits)

### Emails not sending
- Verify `RESEND_API_KEY` is set in Vercel
- Check email addresses in `app/api/orders/route.ts`
- For production, verify your domain in Resend

### Can't log into admin
- Verify user exists in Supabase Authentication
- Check email/password are correct
- Clear browser cache and try again

### Orders not appearing
- Check Supabase database tables are created
- Verify RLS policies allow insertions
- Check browser console for errors

## 🎨 Customization

### Change Colors
Edit `app/globals.css` and Tailwind classes throughout the app.

### Add Categories/Filters
Update catalog schema and add filtering logic in `app/catalogs/page.tsx`.

### Custom Email Templates
Modify email body in `app/api/orders/route.ts` (line 50-65).

### Add Order Status
Add a status column to orders table and update admin pages to show/edit status.

## 📞 Support

For issues with:
- **Next.js**: [Next.js Documentation](https://nextjs.org/docs)
- **Supabase**: [Supabase Documentation](https://supabase.com/docs)
- **Vercel**: [Vercel Documentation](https://vercel.com/docs)
- **Resend**: [Resend Documentation](https://resend.com/docs)

## 📝 License

This project is open source and available for any use.

## 🎉 You're All Set!

Your wholesale catalog platform is now live and ready to use. Upload your catalogs, share the link with your customers, and start receiving orders!

---

**Built with ❤️ using 100% free tools**

