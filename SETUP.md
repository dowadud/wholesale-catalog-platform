# Quick Setup Guide

This guide will get you from zero to deployed in about 15 minutes.

## ⚡ Quick Start Checklist

- [ ] Create Supabase project
- [ ] Run database schema
- [ ] Create admin user
- [ ] Get Resend API key
- [ ] Deploy to Vercel
- [ ] Update email addresses
- [ ] Test the platform

## Step-by-Step Setup

### 1. Supabase Setup (5 minutes)

1. **Create Project**
   - Go to https://supabase.com
   - Click "New Project"
   - Name: `wholesale-catalog`
   - Password: [generate strong password]
   - Region: Choose closest to you
   - Wait 2-3 minutes for setup

2. **Run Database Schema**
   - Click "SQL Editor" (left sidebar)
   - Click "New Query"
   - Copy everything from `supabase/schema.sql`
   - Paste and click "Run"
   - You should see "Success. No rows returned"

3. **Create Admin User**
   - Click "Authentication" (left sidebar)
   - Click "Users" tab
   - Click "Add User" → "Create new user"
   - Email: `your-email@example.com`
   - Password: [create strong password]
   - Click "Create user"
   - **Write down these credentials!**

4. **Get API Keys**
   - Click "Settings" (gear icon at bottom)
   - Click "API"
   - Copy and save these THREE values:
     ```
     Project URL: https://xxxxx.supabase.co
     anon public: eyJhbGc...
     service_role: eyJhbGc... (keep secret!)
     ```

### 2. Resend Setup (2 minutes)

1. **Create Account**
   - Go to https://resend.com
   - Sign up with your email
   - Verify your email

2. **Get API Key**
   - Click "API Keys" (left sidebar)
   - Click "Create API Key"
   - Name: `wholesale-catalog`
   - Copy the key (starts with `re_`)
   - **Save it - you won't see it again!**

3. **Domain (Optional for now)**
   - For testing, use default domain
   - For production, add your domain in "Domains" section

### 3. GitHub Setup (3 minutes)

1. **Create Repository**
   ```bash
   cd /Users/nadhirmacbookpro/wholesale-catalog-platform
   git init
   git add .
   git commit -m "Initial commit - wholesale catalog platform"
   ```

2. **Push to GitHub**
   - Go to https://github.com/new
   - Name: `wholesale-catalog-platform`
   - Make it Private or Public
   - Don't initialize with README (we already have one)
   - Copy the commands and run:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/wholesale-catalog-platform.git
   git branch -M main
   git push -u origin main
   ```

### 4. Vercel Deployment (5 minutes)

1. **Import Project**
   - Go to https://vercel.com
   - Click "Add New..." → "Project"
   - Click "Import" next to your GitHub repo
   - If you don't see it, click "Adjust GitHub App Permissions"

2. **Configure Environment Variables**
   Click "Environment Variables" and add these:

   | Name | Value |
   |------|-------|
   | `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |
   | `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key |
   | `RESEND_API_KEY` | Your Resend API key |

3. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Click "Visit" when done
   - **Copy your live URL!**

### 5. Configure Email Addresses (2 minutes)

Your app is live but emails go to placeholder addresses. Let's fix that:

1. **Update Email Settings**
   - Open your GitHub repo
   - Go to `app/api/orders/route.ts`
   - Click the pencil icon to edit
   - Find lines 70-71:
   ```typescript
   from: 'orders@yourdomain.com', // Change this
   to: 'admin@yourdomain.com',    // Change this
   ```
   - Update to your actual emails
   - Commit changes

2. **Vercel Auto-Deploys**
   - Vercel automatically detects the change
   - Wait 1-2 minutes for redeployment
   - Your emails now work!

### 6. Test Everything (3 minutes)

1. **Test Public Site**
   - Visit your Vercel URL
   - Click "View Catalogs" (should be empty)
   - Click "Place Order" (form should load)

2. **Test Admin Login**
   - Go to `your-url.com/admin`
   - Enter your Supabase admin credentials
   - Should see dashboard

3. **Test Upload**
   - Click "Upload Catalog"
   - Upload a test PDF
   - Go back to public "View Catalogs" page
   - Your PDF should appear!

4. **Test Order**
   - Click "Place Order"
   - Fill in customer info
   - Add a few items
   - Submit
   - Check admin email for notification
   - Check admin orders page

## 🎉 You're Done!

Your wholesale catalog platform is now:
- ✅ Live on the internet
- ✅ Accepting catalog uploads
- ✅ Taking customer orders
- ✅ Sending email notifications
- ✅ 100% free to run

## 📧 Share With Customers

Send them this message:

```
Visit our wholesale catalog at: [YOUR_VERCEL_URL]

Browse our catalogs and place orders directly online.
You'll receive a confirmation email after submitting.
```

## 🔄 Next Steps

- Upload your actual product catalogs
- Customize the homepage with your branding
- Add your logo
- Update colors in `app/globals.css`
- Add more admin users if needed

## ⚠️ Important Notes

1. **Backup Admin Credentials**
   - Email: _____________
   - Password: _____________

2. **Save Your URLs**
   - Live Site: _____________
   - Supabase URL: _____________
   - GitHub Repo: _____________

3. **Free Tier Limits**
   - Resend: 100 emails/day
   - Supabase: 1GB storage
   - Vercel: 100GB bandwidth/month

## 🆘 Something Not Working?

### Can't log into admin
- Double-check email/password
- Make sure user was created in Supabase
- Try password reset in Supabase

### Upload fails
- Check file is PDF format
- Check file size (keep under 50MB)
- Verify storage bucket was created

### No email received
- Check spam folder
- Verify RESEND_API_KEY in Vercel
- Check email addresses in code
- Check Resend dashboard for delivery logs

### Site won't deploy
- Check all environment variables are set
- Check GitHub repo is accessible
- Check Vercel deployment logs

## 📚 Resources

- Full Documentation: See `README.md`
- Supabase Docs: https://supabase.com/docs
- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs

---

**Need help? Check the README.md for detailed troubleshooting.**

