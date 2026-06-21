# Deployment Guide - Render

This guide covers deploying the College ERP application to Render.

## Prerequisites

1. **Render Account**: Create a free account at [render.com](https://render.com)
2. **MongoDB Database**: Set up a MongoDB Atlas database at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
3. **Cloudinary Account**: Create an account at [cloudinary.com](https://cloudinary.com) for file uploads
4. **GitHub Repository**: Push your code to GitHub (required for Render deployments)
5. **Email Service**: Gmail account with an app-specific password for notifications

## Step 1: Prepare Your MongoDB Database

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster (M0)
3. Set up database access credentials
4. Add your IP address to the whitelist (or use 0.0.0.0/0 for development)
5. Get your connection string: `mongodb+srv://username:password@cluster.mongodb.net/college-erp?retryWrites=true&w=majority`

## Step 2: Prepare Environment Variables

Gather all required environment variables:

- **MONGODB_URI**: Your MongoDB Atlas connection string
- **JWT_SECRET**: Generate a strong secret (use `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
- **CLOUDINARY_CLOUD_NAME**: From your Cloudinary dashboard
- **CLOUDINARY_API_KEY**: From your Cloudinary dashboard
- **CLOUDINARY_API_SECRET**: From your Cloudinary dashboard
- **SMTP_HOST**: `smtp.gmail.com`
- **SMTP_PORT**: `587`
- **SMTP_USER**: Your Gmail email
- **SMTP_PASS**: App-specific password (not your Gmail password)

### Generate Gmail App Password:

1. Enable 2-Factor Authentication in your Gmail account
2. Go to Google Account → Security → App passwords
3. Generate a password for "Mail" → "Windows Computer"
4. Use this password as `SMTP_PASS`

## Step 3: Push Code to GitHub

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit for college-erp deployment"

# Create a new repository on GitHub and push
# Replace YOUR_USERNAME and YOUR_REPO with your details
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

## Step 4: Deploy to Render

### Option A: Using render.yaml (Recommended)

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Blueprint"
3. Connect your GitHub repository
4. Select the branch and confirm
5. Render will automatically detect `render.yaml` and create the service
6. Add the environment variables when prompted

### Option B: Manual Service Creation

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Choose your repository and branch
5. Configure settings:
   - **Name**: `college-erp`
   - **Runtime**: `Node`
   - **Build Command**: `npm run build:all`
   - **Start Command**: `npm start`
   - **Instance Type**: Free tier is fine for testing
6. Add environment variables in "Environment" section:
   ```
   NODE_ENV=production
   MONGODB_URI=your_mongodb_uri
   CLIENT_URL=https://college-erp.onrender.com (update with your actual URL after deployment)
   JWT_SECRET=your_secret
   JWT_EXPIRE=7d
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password
   ```
7. Click "Create Web Service"

## Step 5: Update Environment Variables

After deployment completes and you get your Render URL:

1. Update `CLIENT_URL` in Render environment variables with your actual URL
2. Redeploy the service

## Step 6: Initialize Database (Optional)

If you have seed data:

```bash
# Access Render shell
# Go to your service → Logs → Shells (if available)
# Or use the onrender.com web terminal feature

# Run seed script
npm run seed
```

## Troubleshooting

### Build Fails

- Check logs in Render dashboard
- Ensure all dependencies are in package.json
- Verify Node version compatibility

### Database Connection Issues

- Check MongoDB connection string
- Verify IP whitelist in MongoDB Atlas
- Ensure MONGODB_URI is set correctly

### Socket.io Not Working

- Verify CORS settings match CLIENT_URL
- Check browser console for connection errors
- Ensure the websocket protocol is allowed

### Static Files Not Served

- Ensure `npm run build:all` completes successfully
- Check that client/dist folder is generated
- Verify NODE_ENV=production is set

## Monitoring

After deployment:

1. Check application health: `https://your-app-name.onrender.com/health`
2. Monitor logs in Render dashboard
3. Set up email alerts in Render settings

## Free Tier Limitations

- Services auto-spin down after 15 minutes of inactivity
- Limited to one free service
- 0.5 GB RAM
- Upgrade to paid plan for production use

## Production Recommendations

1. **Upgrade to Paid Plan** for consistent uptime
2. **Set up a Custom Domain** in Render settings
3. **Enable Auto-Deploy** for GitHub pushes
4. **Regular Backups** of MongoDB database
5. **Monitor Logs** regularly for errors
6. **Update Dependencies** regularly for security patches

## Rolling Back

If deployment has issues:

1. Go to your service in Render
2. Click "Deployments" tab
3. Select a previous successful deployment
4. Click "Deploy" to redeploy that version

---

For more help: [Render Documentation](https://render.com/docs)
