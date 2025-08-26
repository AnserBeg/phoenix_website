# 🚀 Netlify Quick Reference

## Build Settings
```
Base directory: frontend
Build command: npm ci && npm run build
Publish directory: build
```

## Environment Variables
```
REACT_APP_BACKEND_URL=https://your-backend-url.railway.app
REACT_APP_API_URL=https://your-backend-url.railway.app/api
```

## Deployment Steps
1. **Connect GitHub** → Select `phoenix_website` repo
2. **Set build directory** to `frontend`
3. **Set publish directory** to `build`
4. **Set build command** to `npm ci && npm run build`
5. **Deploy site**
6. **Add environment variables** in Site Settings
7. **Add custom domain** in Domain Management

## Important Notes
- ✅ **Free tier**: Unlimited personal projects
- ✅ **Custom domain**: Yes, with SSL certificate
- ✅ **Auto-deploy**: From Git pushes
- ✅ **Build logs**: Available in dashboard
- ⚠️ **Backend**: Must be deployed separately (Railway recommended)

## Troubleshooting
- **Build fails**: Check Node.js version (18+)
- **API errors**: Verify environment variables
- **Images not loading**: Check backend URL and CORS
- **Routing issues**: Check `netlify.toml` redirects

## Support
- **Docs**: [docs.netlify.com](https://docs.netlify.com)
- **Community**: [community.netlify.com](https://community.netlify.com)
