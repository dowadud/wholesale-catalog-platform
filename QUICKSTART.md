# 🚀 Quick Start Guide

Get your wholesale catalog platform live in 15 minutes!

## Prerequisites Checklist

Before you begin, create accounts at:
- [ ] [Supabase](https://supabase.com) - Database & Auth
- [ ] [Vercel](https://vercel.com) - Hosting
- [ ] [Resend](https://resend.com) - Email
- [ ] [GitHub](https://github.com) - Code repository

## 5-Step Deployment

### Step 1: Supabase (3 min)
1. Create new project at supabase.com
2. SQL Editor → Run `supabase/schema.sql`
3. Authentication → Add admin user
4. Settings → API → Copy 3 keys

### Step 2: Resend (1 min)
1. Create account at resend.com
2. API Keys → Create key
3. Copy the key (starts with `re_`)

### Step 3: GitHub (2 min)
```bash
cd /Users/nadhirmacbookpro/wholesale-catalog-platform
git init
git add .
git commit -m "Initial commit"
# Push to your GitHub repo
```

### Step 4: Vercel (5 min)
1. Import your GitHub repo
2. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `RESEND_API_KEY`
3. Deploy!

### Step 5: Configure (2 min)
1. Edit `app/api/orders/route.ts`
2. Update email addresses (lines 70-71)
3. Commit and push

## ✅ You're Live!

Visit your Vercel URL and test:
- Homepage loads
- Admin login works
- Upload a PDF catalog
- Submit a test order

## 📚 Need More Details?

- **Full Setup**: See `SETUP.md`
- **Documentation**: See `README.md`
- **Deployment**: See `DEPLOYMENT.md`

## 🆘 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Can't login | Check admin user created in Supabase |
| Upload fails | Verify schema.sql ran successfully |
| No emails | Check RESEND_API_KEY in Vercel |
| Page not found | Wait 2 min for Vercel deploy |

---

**Total Time**: ~15 minutes  
**Total Cost**: $0 (free tier)  
**Result**: Live wholesale ordering platform! 🎉

