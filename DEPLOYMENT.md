# Deployment Guide - Google Cloud Platform

## 🎯 Overview
This guide covers deploying the RFAI Equilibrar application to Google Cloud Platform using:
- **Cloud SQL** for MySQL database
- **Cloud Run** for backend API
- **Cloud Storage + CDN** for frontend

## 📋 Prerequisites
- Google Cloud account with billing enabled
- gcloud CLI installed (https://cloud.google.com/sdk/docs/install)
- Project ID created on GCP

## 🗄️ Phase 1: Database Setup (Cloud SQL)

### 1. Create Cloud SQL Instance
```bash
gcloud sql instances create rfai-mysql \
  --database-version=MYSQL_8_0 \
  --tier=db-f1-micro \
  --region=us-central1 \
  --root-password=YOUR_SECURE_PASSWORD
```

### 2. Create Database
```bash
gcloud sql databases create reprogramacion_foca \
  --instance=rfai-mysql
```

### 3. Import Schema
```bash
# Upload schema to Cloud Storage first
gsutil cp database/schema.sql gs://YOUR_BUCKET/schema.sql

# Import to Cloud SQL
gcloud sql import sql rfai-mysql gs://YOUR_BUCKET/schema.sql \
  --database=reprogramacion_foca
```

### 4. Configure Connection
```bash
# Get connection name
gcloud sql instances describe rfai-mysql --format="value(connectionName)"

# Update your .env with Cloud SQL details
DB_HOST=/cloudsql/PROJECT_ID:REGION:INSTANCE_NAME
```

## 🚀 Phase 2: Backend Deployment (Cloud Run)

### 1. Create Dockerfile
```dockerfile
# Create this file: server/Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY server ./server
EXPOSE 3005
CMD ["node", "server/index.js"]
```

### 2. Build and Deploy
```bash
# Build container
gcloud builds submit --tag gcr.io/PROJECT_ID/rfai-backend ./server

# Deploy to Cloud Run
gcloud run deploy rfai-backend \
  --image gcr.io/PROJECT_ID/rfai-backend \
  --platform managed \
  --region us-central1 \
  --add-cloudsql-instances PROJECT_ID:REGION:rfai-mysql \
  --set-env-vars DB_HOST=/cloudsql/PROJECT_ID:REGION:rfai-mysql,DB_NAME=reprogramacion_foca,DB_USER=root,DB_PASSWORD=YOUR_PASSWORD \
  --allow-unauthenticated
```

### 3. Get Backend URL
```bash
gcloud run services describe rfai-backend --region us-central1 --format="value(status.url)"
```

## 🌐 Phase 3: Frontend Deployment

### Option A: Cloud Storage + CDN (Recommended for Static)
```bash
# Build production frontend
npm run build

# Create bucket
gsutil mb gs://rfai-equilibrar-frontend

# Upload build files
gsutil -m cp -r dist/* gs://rfai-equilibrar-frontend/

# Make bucket public
gsutil iam ch allUsers:objectViewer gs://rfai-equilibrar-frontend

# Enable website configuration
gsutil web set -m index.html -e index.html gs://rfai-equilibrar-frontend
```

### Option B: Cloud Run (For SSR)
```dockerfile
# Dockerfile in project root
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```bash
gcloud run deploy rfai-frontend \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

## 🔐 Security Configuration

### 1. Set up Cloud Armor (DDoS Protection)
```bash
gcloud compute security-policies create rfai-security-policy \
  --description "RFAI security policy"

gcloud compute security-policies rules create 1000 \
  --security-policy rfai-security-policy \
  --expression "origin.region_code == 'CL'" \
  --action "allow"
```

### 2. Configure HTTPS
```bash
# Cloud Run provides HTTPS automatically
# For custom domain:
gcloud run domain-mappings create --service rfai-backend --domain api.equilibrar.cl
gcloud run domain-mappings create --service rfai-frontend --domain app.equilibrar.cl
```

### 3. Environment Variables
```bash
# Never hardcode secrets!
# Use Secret Manager
echo -n "YOUR_DB_PASSWORD" | gcloud secrets create db-password --data-file=-

# Grant access to Cloud Run
gcloud secrets add-iam-policy-binding db-password \
  --member=serviceAccount:PROJECT_NUMBER-compute@developer.gserviceaccount.com \
  --role=roles/secretmanager.secretAccessor
```

## 📊 Monitoring & Logging

### Enable Cloud Monitoring
```bash
# Logs are automatic in Cloud Run
# View logs:
gcloud run services logs read rfai-backend --region us-central1

# Set up alerts
gcloud alpha monitoring policies create \
  --notification-channels=CHANNEL_ID \
  --display-name="High Error Rate" \
  --condition-threshold-value=10
```

## 💰 Cost Estimation (Monthly)

| Service | Tier | Estimated Cost |
|---------|------|----------------|
| Cloud SQL | db-f1-micro | ~$7 |
| Cloud Run (Backend) | Pay-per-use | ~$5-15 |
| Cloud Storage | Standard | ~$1 |
| Cloud CDN | Per GB | ~$3-10 |
| **Total** | | **~$16-33/month** |

## 🔄 CI/CD Setup (Optional)

### GitHub Actions Workflow
```yaml
# .github/workflows/deploy.yml
name: Deploy to GCP
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: google-github-actions/setup-gcloud@v0
        with:
          project_id: ${{ secrets.GCP_PROJECT_ID }}
          service_account_key: ${{ secrets.GCP_SA_KEY }}
      - run: |
          gcloud builds submit --tag gcr.io/${{ secrets.GCP_PROJECT_ID }}/rfai-backend
          gcloud run deploy rfai-backend --image gcr.io/${{ secrets.GCP_PROJECT_ID }}/rfai-backend
```

## ✅ Post-Deployment Checklist
- [ ] Database is accessible from Cloud Run
- [ ] Backend API returns 200 on /api/health
- [ ] Frontend loads correctly
- [ ] HTTPS is working
- [ ] Environment variables are set
- [ ] Monitoring is active
- [ ] Backups are configured
- [ ] Custom domain is mapped (if applicable)

## 🆘 Troubleshooting

### "Cannot connect to Cloud SQL"
- Verify Cloud SQL instance is running
- Check connection name in env vars
- Verify service account has Cloud SQL Client role

### "502 Bad Gateway"
- Check backend logs: `gcloud run services logs read rfai-backend`
- Verify environment variables are set
- Check database connection string

### "Frontend not loading"
- Clear browser cache
- Check CORS settings in backend
- Verify API_URL in frontend points to Cloud Run URL

## 📚 Additional Resources
- [Google Cloud SQL Documentation](https://cloud.google.com/sql/docs)
- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [MobaXterm SSH Setup for Cloud](https://cloud.google.com/compute/docs/instances/connecting-advanced)

## 🎉 Status
Deployment guide completed. Ready for production deployment when needed!
