# Netlify Deployment Guide

## Prerequisites
- A GitHub account with your project repository
- A Netlify account (free)
- Your backend deployed (Railway recommended)

## Step 1: Prepare Your Repository

1. **Commit and push your changes** to GitHub:
   ```bash
   git add .
   git commit -m "Add Netlify configuration"
   git push origin main
   ```

2. **Ensure your backend is deployed** and you have the production URL

## Step 2: Deploy to Netlify

### Option A: Deploy via Netlify UI (Recommended for beginners)

1. **Go to [netlify.com](https://netlify.com)** and sign up/login
2. **Click "New site from Git"**
3. **Choose GitHub** and authorize Netlify
4. **Select your repository** (`phoenix_website`)
5. **Configure build settings**:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `build`
6. **Click "Deploy site"**

### Option B: Deploy via Netlify CLI

1. **Install Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**:
   ```bash
   netlify login
   ```

3. **Deploy**:
   ```bash
   cd frontend
   netlify deploy
   ```

## Step 3: Configure Environment Variables

1. **In your Netlify dashboard**, go to **Site settings** → **Environment variables**
2. **Add the following variables**:
   - `REACT_APP_BACKEND_URL`: Your backend URL (e.g., `https://your-app.railway.app`)
   - `REACT_APP_API_URL`: Your API URL (e.g., `https://your-app.railway.app/api`)

## Step 4: Configure Custom Domain

1. **In Netlify dashboard**, go to **Domain management**
2. **Click "Add custom domain"**
3. **Enter your domain** (e.g., `www.yourdomain.com`)
4. **Follow the DNS configuration instructions**

### DNS Configuration (if using external domain provider):
- **Type**: CNAME
- **Name**: www (or @ for root domain)
- **Value**: `your-site-name.netlify.app`

## Step 5: Test Your Deployment

1. **Visit your Netlify URL** to ensure the site loads
2. **Test all functionality** including API calls
3. **Check browser console** for any errors

## Troubleshooting

### Build Errors
- **Check Node.js version**: Ensure you're using Node 18+
- **Check build logs**: Look for specific error messages
- **Verify dependencies**: Run `npm install` locally first

### API Connection Issues
- **Verify backend URL**: Ensure it's accessible
- **Check CORS**: Your backend should allow your Netlify domain
- **Environment variables**: Verify they're set correctly in Netlify

### Image Loading Issues
- **Check image paths**: Ensure they're relative or absolute URLs
- **Verify backend**: Images are served from your backend

## Performance Optimization

Your `netlify.toml` already includes:
- **Static asset caching** (1 year for JS/CSS/images)
- **Security headers** (XSS protection, frame options)
- **SPA routing** (handles React Router)

## Next Steps

1. **Deploy your backend** to Railway or Render
2. **Update environment variables** with your backend URL
3. **Test thoroughly** before going live
4. **Set up monitoring** and analytics

## Support

- **Netlify Docs**: [docs.netlify.com](https://docs.netlify.com)
- **Netlify Community**: [community.netlify.com](https://community.netlify.com)
- **Build Issues**: Check the build logs in your Netlify dashboard
