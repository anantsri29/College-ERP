# Render Deployment - Quick Start

## 1-Minute Setup Summary

### Prerequisites

- MongoDB Atlas account with connection string
- Cloudinary API credentials
- Gmail account with app-specific password
- GitHub repository with your code

### Environment Variables Needed

```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/college-erp
JWT_SECRET=your-secret-key
CLOUDINARY_CLOUD_NAME=your-cloud
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Deploy on Render

1. Go to https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Select your GitHub repo (college-erp)
4. Set Build Command: `npm run build:all`
5. Set Start Command: `npm start`
6. Add environment variables (list above)
7. Click "Create Web Service"
8. Wait ~5-10 minutes for deployment

### Verify Deployment

- Visit `https://college-erp.onrender.com/health` (should show OK)
- Test login functionality
- Check browser Network tab for errors

## Files Created/Updated

✅ `render.yaml` - Render configuration file
✅ `DEPLOYMENT.md` - Detailed deployment guide
✅ `DEPLOYMENT_CHECKLIST.md` - Step-by-step checklist
✅ `package.json` - Added build:all script
✅ `server.js` - Fixed static file serving
✅ `.gitignore` - Updated with sensitive files

## Need Specific Help?

### MongoDB Setup?

1. Go to https://www.mongodb.com/cloud/atlas
2. Create free cluster (M0)
3. Add user credentials
4. Whitelist IP (use 0.0.0.0/0 for now)
5. Get connection string

### Gmail App Password?

1. Enable 2-Factor Auth in Gmail
2. Go to Google Account → Security → App passwords
3. Select Mail → Windows Computer
4. Copy the generated password

### Cloudinary Setup?

1. Go to https://cloudinary.com
2. Sign up (free tier)
3. Find credentials in dashboard

## Troubleshooting Commands

```bash
# Test locally before deploying
npm install:all
npm run build:all

# Check if build succeeds
cd client && npm run build

# Run locally
npm run dev

# Check server starts
cd server && npm start
```

## Free Tier Limitations

- ⏰ Auto-spins down after 15 mins of inactivity
- 💾 0.5 GB RAM
- 🔄 Limited to one free service
- 📈 Upgrade for production use

## Live Dashboard

Once deployed, monitor at: https://dashboard.render.com/services

---

**Questions?** Read the full guide in `DEPLOYMENT.md`
