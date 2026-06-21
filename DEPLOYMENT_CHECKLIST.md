# Render Deployment Checklist

## Pre-Deployment Setup Checklist

### 1. Repository Setup

- [ ] Code pushed to GitHub (public or private repository)
- [ ] Repository is accessible from GitHub
- [ ] Main branch is up to date

### 2. Database Setup

- [ ] MongoDB Atlas account created
- [ ] Free M0 cluster created
- [ ] Database user created with credentials
- [ ] Connection string copied: `mongodb+srv://username:password@cluster.mongodb.net/college-erp?retryWrites=true&w=majority`
- [ ] IP whitelist updated (add 0.0.0.0/0 or your Render IP)

### 3. Cloudinary Setup

- [ ] Cloudinary account created
- [ ] Cloud name copied
- [ ] API Key copied
- [ ] API Secret copied

### 4. Email Configuration

- [ ] Gmail account ready
- [ ] 2-Factor Authentication enabled
- [ ] App-specific password generated
- [ ] SMTP credentials ready:
  - Host: smtp.gmail.com
  - Port: 587
  - User: your_email@gmail.com
  - Pass: app_specific_password

### 5. Environment Variables Prepared

- [ ] MONGODB_URI
- [ ] JWT_SECRET (generated)
- [ ] JWT_EXPIRE = 7d
- [ ] CLOUDINARY_CLOUD_NAME
- [ ] CLOUDINARY_API_KEY
- [ ] CLOUDINARY_API_SECRET
- [ ] SMTP_HOST
- [ ] SMTP_PORT
- [ ] SMTP_USER
- [ ] SMTP_PASS

### 6. Code Preparation

- [ ] `.env` file NOT committed to git
- [ ] `render.yaml` file present in root
- [ ] `package.json` scripts updated (build:all, start)
- [ ] `server.js` configured to serve static files
- [ ] All dependencies listed in package.json files

### 7. Render Account Setup

- [ ] Render account created at render.com
- [ ] GitHub connected to Render account
- [ ] Free tier plan selected

## Deployment Steps

### Step 1: Create Web Service

- [ ] Go to Render Dashboard
- [ ] Click "New +" → "Web Service"
- [ ] Select your college-erp GitHub repository
- [ ] Select main branch

### Step 2: Configure Service

- [ ] Service Name: `college-erp`
- [ ] Runtime: Node
- [ ] Build Command: `npm run build:all`
- [ ] Start Command: `npm start`
- [ ] Instance Type: Free (or select paid for production)

### Step 3: Set Environment Variables

- [ ] Add all environment variables from section 5
- [ ] Double-check all values are correct
- [ ] No typos in variable names

### Step 4: Deploy

- [ ] Click "Create Web Service"
- [ ] Watch deployment logs
- [ ] Wait for "Service is live" message

### Step 5: Post-Deployment

- [ ] Note the Render URL (e.g., college-erp.onrender.com)
- [ ] Update CLIENT_URL environment variable with full URL
- [ ] Trigger redeploy to apply CLIENT_URL change
- [ ] Test health endpoint: https://college-erp.onrender.com/health
- [ ] Test login functionality
- [ ] Test file upload functionality
- [ ] Check browser console for Socket.io connection

## Quick Testing After Deployment

```bash
# Test if service is running
curl https://college-erp.onrender.com/health

# Check logs in Render Dashboard
# Go to Service → Logs

# Test API endpoints
# Try login, check responses in browser Network tab
```

## Common Issues & Solutions

| Issue                             | Solution                                             |
| --------------------------------- | ---------------------------------------------------- |
| Build fails                       | Check logs, ensure all dependencies in package.json  |
| Database not connecting           | Verify MONGODB_URI, check MongoDB Atlas whitelist    |
| Frontend not loading              | Ensure npm run build:all succeeds, check dist folder |
| Socket.io not working             | Verify CLIENT_URL matches, check CORS settings       |
| 502 Bad Gateway                   | Service might be starting, wait 1-2 minutes          |
| Environment variables not working | Re-deploy after adding variables                     |

## After Successful Deployment

1. **Monitor Logs**: Check Render dashboard daily for errors
2. **Test Regularly**: Use the application on production
3. **Backup Database**: Set up automated backups in MongoDB Atlas
4. **Update Records**: Document all credentials securely
5. **Set Alerts**: Configure email alerts in Render settings

## Need Help?

- Render Docs: https://render.com/docs
- MongoDB Docs: https://docs.mongodb.com
- Check application logs: Render Dashboard → Service → Logs
- Review Network tab in browser for API errors
