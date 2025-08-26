# ✅ Railway Deployment Checklist

## Pre-Deployment Checklist

### Code Preparation
- [ ] All changes committed and pushed to GitHub
- [ ] `requirements.txt` contains all necessary dependencies
- [ ] No hardcoded localhost URLs in code
- [ ] Environment variables properly configured
- [ ] CORS settings allow your frontend domain

### Repository Structure
- [ ] `railway.toml` file created
- [ ] `nixpacks.toml` file created
- [ ] `Procfile` created
- [ ] All configuration files committed

## Railway Deployment Steps

### Step 1: Create Railway Project
- [ ] Go to [railway.app](https://railway.app)
- [ ] Sign up/login to Railway
- [ ] Click "New Project"
- [ ] Choose "Deploy from GitHub repo"
- [ ] Select `phoenix_website` repository
- [ ] Set root directory to `backend`
- [ ] Click "Deploy Now"

### Step 2: Configure Environment Variables
- [ ] Go to your service in Railway dashboard
- [ ] Click "Variables" tab
- [ ] Add `SECRET_KEY` (strong random string)
- [ ] Add `CORS_ORIGINS` (your Netlify domain)
- [ ] Add `MONGODB_URI` (if using database)
- [ ] Add `ACCESS_TOKEN_EXPIRE_MINUTES` (optional)

### Step 3: Get Railway URL
- [ ] Go to "Settings" tab in your service
- [ ] Under "Domains", click "Generate Domain"
- [ ] Copy the generated URL (e.g., `your-app.railway.app`)
- [ ] Test the URL + `/api/` endpoint

### Step 4: Update Frontend (Netlify)
- [ ] Go to your Netlify dashboard
- [ ] Navigate to Environment Variables
- [ ] Update `REACT_APP_BACKEND_URL` with Railway URL
- [ ] Update `REACT_APP_API_URL` with Railway URL + `/api`
- [ ] Trigger a new deployment

## Post-Deployment Testing

### Backend Testing
- [ ] Railway service is running (green status)
- [ ] API endpoint responds at `/api/`
- [ ] File uploads work correctly
- [ ] Authentication endpoints work
- [ ] Check Railway logs for errors

### Frontend Testing
- [ ] Netlify site loads correctly
- [ ] API calls to Railway backend work
- [ ] File uploads from frontend work
- [ ] Authentication flows work
- [ ] No CORS errors in browser console

### Integration Testing
- [ ] Complete user journey works end-to-end
- [ ] File uploads persist between sessions
- [ ] Authentication tokens work correctly
- [ ] All CRUD operations function

## Environment Variables Reference

### Required Variables
```bash
SECRET_KEY=your-super-secret-key-here
CORS_ORIGINS=https://your-site.netlify.app
```

### Optional Variables
```bash
MONGODB_URI=your-mongodb-connection-string
ACCESS_TOKEN_EXPIRE_MINUTES=10080
```

### Frontend Variables (Netlify)
```bash
REACT_APP_BACKEND_URL=https://your-app.railway.app
REACT_APP_API_URL=https://your-app.railway.app/api
```

## Troubleshooting Checklist

### Build Issues
- [ ] Check Python version compatibility (3.9)
- [ ] Verify all dependencies in requirements.txt
- [ ] Check Railway build logs
- [ ] Ensure no syntax errors in code

### Runtime Issues
- [ ] Check Railway service logs
- [ ] Verify environment variables are set
- [ ] Test API endpoints individually
- [ ] Check CORS configuration

### Integration Issues
- [ ] Verify Railway URL is correct
- [ ] Check Netlify environment variables
- [ ] Test CORS headers
- [ ] Verify file upload permissions

## Final Verification

### Performance
- [ ] API response times are acceptable
- [ ] File uploads complete successfully
- [ ] No memory leaks or crashes
- [ ] Service stays responsive

### Security
- [ ] SECRET_KEY is strong and unique
- [ ] CORS is properly configured
- [ ] Authentication tokens work
- [ ] File uploads are secure

### Monitoring
- [ ] Railway logs are accessible
- [ ] Error tracking is working
- [ ] Performance metrics available
- [ ] Uptime monitoring active

## Next Steps After Deployment

- [ ] Set up custom domain (optional)
- [ ] Configure monitoring and alerts
- [ ] Set up backup strategies
- [ ] Plan for scaling
- [ ] Document deployment process

---

**Status**: ⏳ Ready for deployment
**Last Updated**: [Date]
**Deployed By**: [Your Name]
