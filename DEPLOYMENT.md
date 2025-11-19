# Deployment Checklist

Use this checklist when deploying updates or setting up a new instance.

## Initial Deployment

### Supabase
- [ ] Project created
- [ ] Database schema executed (`supabase/schema.sql`)
- [ ] Storage bucket `catalogs` created (handled by schema)
- [ ] Admin user created in Authentication
- [ ] API keys copied (URL, anon key, service role key)

### Resend
- [ ] Account created
- [ ] API key generated
- [ ] (Production) Domain verified

### Vercel
- [ ] GitHub repository connected
- [ ] Environment variables configured:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - [ ] `RESEND_API_KEY`
- [ ] Initial deployment successful
- [ ] Custom domain connected (if applicable)

### Code Configuration
- [ ] Email addresses updated in `app/api/orders/route.ts`
- [ ] Site name/branding updated (if desired)
- [ ] Colors customized (if desired)

### Testing
- [ ] Public homepage loads
- [ ] Catalogs page accessible
- [ ] Order form functional
- [ ] Admin login works
- [ ] Catalog upload works
- [ ] Order submission works
- [ ] Email notification received
- [ ] CSV export works

## Redeployment / Updates

When pushing updates:

1. **Test Locally First**
   ```bash
   npm install
   npm run dev
   ```
   Visit http://localhost:3000 and test changes

2. **Commit and Push**
   ```bash
   git add .
   git commit -m "Description of changes"
   git push
   ```

3. **Vercel Auto-Deploys**
   - Deployment starts automatically
   - Check Vercel dashboard for status
   - Typical deploy time: 1-2 minutes

4. **Verify Production**
   - Visit your live URL
   - Test the changed features
   - Check admin functionality

## Environment Variables Update

If you need to update environment variables:

1. Go to Vercel Dashboard
2. Select your project
3. Go to "Settings" > "Environment Variables"
4. Edit or add variables
5. Click "Save"
6. Redeploy from "Deployments" tab (or push a new commit)

## Database Schema Updates

If you modify the database schema:

1. Update `supabase/schema.sql` with new changes
2. Go to Supabase Dashboard > SQL Editor
3. Run the migration SQL
4. Test thoroughly before deploying code changes
5. Deploy frontend changes if needed

## Rollback Procedure

If something goes wrong:

1. Go to Vercel Dashboard
2. Click "Deployments"
3. Find the last working deployment
4. Click "..." menu → "Promote to Production"
5. Investigate the issue before redeploying

## Monitoring

### Check These Regularly

1. **Vercel Dashboard**
   - Bandwidth usage
   - Function executions
   - Error logs

2. **Supabase Dashboard**
   - Database size
   - Storage usage
   - Active users
   - Query performance

3. **Resend Dashboard**
   - Email delivery rate
   - Daily/monthly quota usage
   - Bounce/spam rates

## Performance Optimization

### If the site slows down:

1. **Optimize Images**
   - Use Next.js Image component
   - Compress uploaded PDFs

2. **Database**
   - Indexes already created in schema
   - Consider pagination for large datasets

3. **Caching**
   - Vercel automatically caches static pages
   - Consider React Query for data fetching

## Security Checklist

- [ ] Environment variables in Vercel (never in code)
- [ ] `.env.local` in `.gitignore`
- [ ] Service role key never exposed to client
- [ ] RLS policies enabled on all tables
- [ ] Storage policies configured correctly
- [ ] Admin routes check authentication
- [ ] HTTPS enabled (Vercel default)

## Backup Strategy

### Database
1. Go to Supabase Dashboard
2. Database > Backups
3. Free tier: Daily automatic backups (7 days retention)
4. Manual backup: Database > SQL Editor > Export data

### Files
- Supabase Storage has automatic backups
- Consider periodic manual downloads of important files

## Custom Domain Setup (Optional)

1. **Purchase Domain** (e.g., from Namecheap, Google Domains)

2. **Add to Vercel**
   - Vercel Dashboard > Settings > Domains
   - Add your domain
   - Follow DNS configuration instructions

3. **Add to Resend** (for email)
   - Resend Dashboard > Domains
   - Add domain
   - Configure DNS records
   - Verify domain

4. **Update Email Addresses**
   - Use your custom domain in `app/api/orders/route.ts`
   - Example: `orders@yourcustomdomain.com`

## Scaling Considerations

### When you outgrow free tier:

**Vercel Pro** ($20/month)
- Increased bandwidth
- Longer function timeouts
- Team collaboration

**Supabase Pro** ($25/month)
- 8GB database
- 100GB storage
- Daily backups
- Better support

**Resend** (Starts at $20/month)
- 50,000 emails/month
- Better deliverability
- Custom domains

## Support Contacts

- **Vercel Support**: https://vercel.com/support
- **Supabase Support**: https://supabase.com/support
- **Resend Support**: support@resend.com

---

**Last Updated**: [Current Date]
**Deployed By**: [Your Name]
**Production URL**: [Your Vercel URL]

