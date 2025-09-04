# Vercel Deployment Guide

## 🚀 **Deployment Steps**

### **Step 1: Prepare Your Supabase Project**

1. **Get your Supabase credentials:**
   - Go to your Supabase dashboard
   - Navigate to Settings → API
   - Copy your Project URL and anon/public key

2. **Run the database setup:**
   - Go to SQL Editor in Supabase
   - Copy and paste the contents of `database_setup.sql`
   - Execute the script to create tables and sample data

### **Step 2: Deploy to Vercel**

#### **Option A: Deploy via Vercel CLI (Recommended)**

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy from your project directory:**
   ```bash
   vercel
   ```

4. **Set environment variables:**
   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```

5. **Redeploy with environment variables:**
   ```bash
   vercel --prod
   ```

#### **Option B: Deploy via Vercel Dashboard**

1. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Go to [vercel.com](https://vercel.com)**
   - Sign in with GitHub
   - Click "New Project"
   - Import your repository

3. **Configure environment variables:**
   - In project settings, go to Environment Variables
   - Add:
     - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase project URL
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase anon key

4. **Deploy:**
   - Click "Deploy"
   - Wait for deployment to complete

### **Step 3: Verify Deployment**

1. **Test the application:**
   - Visit your Vercel URL
   - Check that the landing page loads
   - Test login functionality
   - Verify real-time feed updates

2. **Test real-time features:**
   - Use the "Real-time Feed Test" component
   - Create test posts
   - Verify they appear instantly

## 🔧 **Environment Variables Required**

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## 📋 **Pre-Deployment Checklist**

- [ ] Supabase project created and configured
- [ ] Database setup script executed
- [ ] Environment variables ready
- [ ] Code committed to Git
- [ ] No TypeScript errors
- [ ] Build passes locally (`npm run build`)

## 🚨 **Common Issues & Solutions**

### **Issue: Build Fails**
- **Solution**: Check for TypeScript errors with `npm run build`
- **Common cause**: Missing type definitions or import errors

### **Issue: Environment Variables Not Working**
- **Solution**: Ensure variables are set in Vercel dashboard
- **Note**: Variables must start with `NEXT_PUBLIC_` for client-side access

### **Issue: Supabase Connection Fails**
- **Solution**: Verify your Supabase URL and key are correct
- **Check**: RLS policies are properly configured

### **Issue: Real-time Updates Not Working**
- **Solution**: Ensure Supabase Realtime is enabled in your project
- **Check**: Database setup script was executed successfully

## 🎯 **Post-Deployment Testing**

1. **Landing Page**: Should load with mock data
2. **Login**: Should work with your auth provider
3. **Feed**: Should show real-time updates
4. **Post Creation**: Should work and appear instantly
5. **Cross-User Updates**: Test in multiple browser tabs

## 📞 **Need Help?**

If you encounter any issues during deployment:

1. **Check Vercel logs** in the dashboard
2. **Verify environment variables** are set correctly
3. **Test database connection** in Supabase
4. **Check browser console** for client-side errors

Let me know if you need help with any specific step!
