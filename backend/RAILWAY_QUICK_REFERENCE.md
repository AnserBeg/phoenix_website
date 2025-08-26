# 🚂 Railway Quick Reference

## Build Settings
```
Root Directory: backend
Builder: nixpacks
Python Version: 3.9
Start Command: uvicorn server:app --host 0.0.0.0 --port $PORT
```

## Required Environment Variables
```bash
SECRET_KEY=your-super-secret-key-here
CORS_ORIGINS=https://your-site.netlify.app,https://yourdomain.com
MONGODB_URI=your-mongodb-connection-string
ACCESS_TOKEN_EXPIRE_MINUTES=10080
```

## Deployment Steps
1. **Go to [railway.app](https://railway.app)**
2. **New Project** → **Deploy from GitHub repo**
3. **Select** `phoenix_website` repository
4. **Set root directory** to `backend`
5. **Deploy Now**
6. **Add environment variables** in Variables tab
7. **Generate domain** in Settings tab

## CLI Commands
```bash
# Install CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
cd backend
railway init
railway up

# View logs
railway logs

# Open dashboard
railway open
```

## Important Notes
- ✅ **Free tier**: $5 credit monthly (usually sufficient)
- ✅ **Custom domain**: Free on all plans
- ✅ **SSL certificate**: Automatically provided
- ✅ **File storage**: Persistent uploads directory
- ⚠️ **Sleep**: Services may sleep after inactivity (free tier)

## Troubleshooting
- **Build fails**: Check Python 3.9 compatibility
- **Runtime errors**: Check Railway logs
- **CORS issues**: Verify CORS_ORIGINS variable
- **File uploads**: Check uploads directory permissions

## Support
- **Docs**: [docs.railway.app](https://docs.railway.app)
- **Discord**: [discord.gg/railway](https://discord.gg/railway)
- **Logs**: Available in Railway dashboard
