# 🚂 Railway Deployment Guide

## Prerequisites
- A GitHub account with your project repository
- A Railway account (free tier available)
- Your project pushed to GitHub

## Step 1: Prepare Your Repository

1. **Commit and push your changes** to GitHub:
   ```bash
   git add .
   git commit -m "Add Railway deployment configuration"
   git push origin main
   ```

2. **Ensure your backend code is ready**:
   - All dependencies are in `requirements.txt`
   - No hardcoded localhost URLs
   - Environment variables are properly configured

## Step 2: Deploy to Railway

### Option A: Deploy via Railway UI (Recommended)

1. **Go to [railway.app](https://railway.app)** and sign up/login
2. **Click "New Project"**
3. **Choose "Deploy from GitHub repo"**
4. **Select your repository** (`phoenix_website`)
5. **⚠️ IMPORTANT: Set the root directory to `backend`**
6. **Click "Deploy Now"**

**Note**: If Railway still can't detect the Python app, try this alternative approach:
1. **Create a new project** in Railway
2. **Choose "Deploy from GitHub repo"**
3. **Select your repository** (`phoenix_website`)
4. **Set root directory to `backend`**
5. **If it still fails, try deploying the entire repo first, then configure the service**

### Option B: Deploy via Railway CLI

1. **Install Railway CLI**:
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway**:
   ```bash
   railway login
   ```

3. **Initialize and deploy**:
   ```bash
   cd backend
   railway init
   railway up
   ```

## Step 3: Configure Environment Variables

1. **In your Railway dashboard**, go to your project
2. **Click on your service** (backend)
3. **Go to "Variables" tab**
4. **Add the following variables**:

```bash
# Security
SECRET_KEY=your-super-secret-key-here-make-it-long-and-random

# CORS (allow your Netlify domain)
CORS_ORIGINS=https://your-site.netlify.app,https://yourdomain.com

# Database (if you add one later)
MONGODB_URI=your-mongodb-connection-string

# Other settings
ACCESS_TOKEN_EXPIRE_MINUTES=10080
```

## Step 4: Configure Domain

1. **In Railway dashboard**, go to your service
2. **Click "Settings" tab**
3. **Under "Domains"**, click "Generate Domain"
4. **Copy the generated URL** (e.g., `your-app.railway.app`)
5. **Use this URL** in your Netlify environment variables

## Step 5: Update Your Frontend

1. **In your Netlify dashboard**, go to Environment Variables
2. **Update the backend URL**:
   ```
   REACT_APP_BACKEND_URL=https://your-app.railway.app
   REACT_APP_API_URL=https://your-app.railway.app/api
   ```

## Step 6: Test Your Deployment

1. **Visit your Railway URL** + `/api/` to test the API
2. **Test file uploads** and other functionality
3. **Check Railway logs** for any errors
4. **Test from your Netlify frontend**

## Important Configuration Notes

### File Uploads
- **Railway provides persistent storage** for your uploads
- **Files are preserved** between deployments
- **No additional setup needed** for basic file storage

### CORS Configuration
- **Update CORS_ORIGINS** to include your Netlify domain
- **Format**: `https://domain1.com,https://domain2.com`
- **No spaces** between URLs

### Environment Variables
- **SECRET_KEY**: Generate a strong random string
- **CORS_ORIGINS**: Your frontend domains
- **PORT**: Automatically set by Railway

## Troubleshooting

### Railway Can't Detect Python App
**Error**: "Railpack could not determine how to build the app"

**Solutions**:
1. **Ensure root directory is set to `backend`** (not the entire repo)
2. **Check that `server.py` exists in the backend directory**
3. **Verify `requirements.txt` is in the backend directory**
4. **Try deploying the entire repo first, then configure the service**

### Build Errors
- **Check Python version**: Railway uses Python 3.9
- **Verify requirements.txt**: All dependencies must be listed
- **Check build logs**: Look for specific error messages

### Runtime Errors
- **Check Railway logs**: Go to your service → Logs tab
- **Verify environment variables**: All required vars must be set
- **Check CORS**: Ensure your frontend domain is allowed

### File Upload Issues
- **Check uploads directory**: Railway creates it automatically
- **Verify file permissions**: Should work out of the box
- **Check storage limits**: Free tier has generous limits

## Performance & Scaling

### Free Tier Limits
- **Deployments**: Unlimited
- **Bandwidth**: Generous limits
- **Storage**: Sufficient for most projects
- **Sleep**: Services may sleep after inactivity

### Upgrading (Optional)
- **Pro plan**: $5/month for always-on services
- **Custom domains**: Available on all plans
- **More resources**: CPU, RAM, storage

## Next Steps

1. **Deploy your backend** to Railway
2. **Update frontend environment variables** with Railway URL
3. **Test the complete system** end-to-end
4. **Set up monitoring** and logging
5. **Configure custom domain** (optional)

## Support

- **Railway Docs**: [docs.railway.app](https://docs.railway.app)
- **Railway Discord**: [discord.gg/railway](https://discord.gg/railway)
- **Build Issues**: Check the build logs in Railway dashboard
- **Runtime Issues**: Check the service logs in Railway dashboard

## Cost Breakdown

- **Free Tier**: $5 credit monthly (usually covers small apps)
- **Pro Plan**: $5/month for always-on services
- **Custom Domains**: Free on all plans
- **SSL Certificates**: Automatically provided
