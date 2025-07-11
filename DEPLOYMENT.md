# 🚀 Schengen Visa Calculator - Deployment Guide

## Quick Deploy to Vercel

### Prerequisites
- GitHub account
- Vercel account (sign up at [vercel.com](https://vercel.com))
- Supabase project (if using authentication features)

### 1. Push to GitHub
```bash
# If you haven't already, push your code to GitHub
git remote add origin https://github.com/yourusername/schengen-visa-calculator.git
git branch -M main
git push -u origin main
```

### 2. Deploy to Vercel

**Option A: One-Click Deploy**
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Vercel will auto-detect Next.js settings
4. Add environment variables (see below)
5. Click "Deploy"

**Option B: Vercel CLI**
```bash
npm i -g vercel
vercel login
vercel --prod
```

### 3. Environment Variables

Add these in Vercel Dashboard → Project → Settings → Environment Variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Custom Domain (Optional)
1. Go to Vercel Dashboard → Project → Settings → Domains
2. Add your custom domain
3. Configure DNS as instructed

---

## Alternative Hosting Options

### Netlify
1. Connect GitHub repository
2. Build command: `npm run build`
3. Publish directory: `.next`

### Railway
1. Connect GitHub repository  
2. Add environment variables
3. Auto-deploys on push

### Render
1. Connect GitHub repository
2. Build command: `npm run build`
3. Start command: `npm start`

---

## 📋 Deployment Checklist

- [ ] ✅ All features tested locally
- [ ] ✅ Environment variables configured
- [ ] ✅ Build passes successfully (`npm run build`)
- [ ] ✅ Repository pushed to GitHub
- [ ] ✅ Domain configured (if custom)
- [ ] ✅ SSL certificate active
- [ ] ✅ Performance optimized

## 🛠️ Troubleshooting

### Build Errors
- Check Next.js version compatibility
- Verify all dependencies in package.json
- Test build locally: `npm run build`

### Environment Variables
- Ensure NEXT_PUBLIC_ prefix for client-side vars
- Check Vercel dashboard for proper configuration
- Restart deployment after adding variables

### Performance Issues  
- Enable Vercel Analytics
- Check bundle size with `npm run build`
- Optimize images and assets

---

## 📊 Features Included

✅ **Core Calculator**: 90/180 day rule compliance  
✅ **Travel Quiz**: Personality-based recommendations  
✅ **Destination Checker**: Visa-free country finder  
✅ **Demo Dashboard**: Sample travel data  
✅ **Authentication**: Supabase auth ready  
✅ **Mobile Responsive**: Touch-optimized design  
✅ **Legal Pages**: Terms, Privacy, Disclaimers  

---

🌍 **Live URL**: https://your-app.vercel.app 