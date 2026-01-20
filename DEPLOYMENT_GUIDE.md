# Aariv - Production Deployment Guide

## 🐳 Docker Deployment

### Quick Start

1. **Build the Docker image:**
```bash
docker build -t aariv-backend:latest .
```

2. **Run with Docker Compose:**
```bash
# Create .env file with required variables
cp backend/.env.example .env

# Start services
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down
```

3. **Run standalone container:**
```bash
docker run -d \
  --name aariv-backend \
  -p 3000:3000 \
  -e OPENAI_API_KEY=your-key \
  -e COMPOSIO_API_KEY=your-key \
  aariv-backend:latest
```

### Health Check

The container includes built-in health checks:
```bash
# Check health status
docker inspect --format='{{.State.Health.Status}}' aariv-backend

# Manual health check
curl http://localhost:3000/api/health
```

### Environment Variables

Required:
- `OPENAI_API_KEY` - OpenAI API key for GPT-4
- `COMPOSIO_API_KEY` - Composio API key for integrations

Optional:
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (production/development)
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `LOG_LEVEL` - Logging level (debug/info/warn/error)

## ☁️ Cloud Deployment

### AWS ECS / Fargate

1. **Build and push to ECR:**
```bash
# Authenticate to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Build and tag
docker build -t aariv-backend .
docker tag aariv-backend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/aariv-backend:latest

# Push
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/aariv-backend:latest
```

2. **Create ECS Task Definition:**
- Container: Use ECR image
- Port: 3000
- Environment: Add all required env vars
- Health check: `/api/health`
- CPU/Memory: 512/1024 minimum

3. **Create ECS Service:**
- Launch type: Fargate
- Load balancer: ALB with health check
- Auto-scaling: Based on CPU/memory

### Google Cloud Run

```bash
# Build and deploy
gcloud builds submit --tag gcr.io/PROJECT_ID/aariv-backend
gcloud run deploy aariv-backend \
  --image gcr.io/PROJECT_ID/aariv-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars OPENAI_API_KEY=your-key,COMPOSIO_API_KEY=your-key
```

### Heroku

```bash
# Login and create app
heroku login
heroku create aariv-backend

# Set environment variables
heroku config:set OPENAI_API_KEY=your-key
heroku config:set COMPOSIO_API_KEY=your-key

# Deploy
git push heroku main
```

### DigitalOcean App Platform

1. Connect GitHub repository
2. Select "Dockerfile" as build method
3. Add environment variables in App Platform console
4. Deploy

## 📊 Monitoring & Logging

### Structured Logging

The backend uses structured logging with automatic formatting:

**Development:** Colored console output
**Production:** JSON logs for easy parsing

Example integration with CloudWatch/Stackdriver:
```typescript
import { logger } from './backend/src/utils/logger';

logger.info('User action', { userId: '123', action: 'login' });
logger.error('API error', new Error('Connection failed'));
```

### Health Monitoring

Monitor the `/api/health` endpoint:
```json
{
  "status": "ok",
  "timestamp": "2026-01-20T10:30:00.000Z",
  "service": "aariv-backend",
  "version": "1.0.0",
  "uptime": 3600.5,
  "environment": "production",
  "checks": {
    "openai": true,
    "composio": true,
    "supabase": true
  }
}
```

### Metrics to Monitor

- Response time (p50, p95, p99)
- Error rate (4xx, 5xx)
- Rate limit hits
- Memory usage
- CPU usage
- Active connections

## 🔒 Security Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use secrets manager (AWS Secrets Manager, GCP Secret Manager)
- [ ] Enable HTTPS only
- [ ] Configure CORS whitelist
- [ ] Set rate limits appropriately
- [ ] Rotate API keys regularly
- [ ] Enable container scanning
- [ ] Use non-root user (already configured in Dockerfile)
- [ ] Implement request signing for webhooks
- [ ] Add API key authentication for sensitive endpoints

## 🚀 Performance Optimization

### Horizontal Scaling

The backend is stateless and can be scaled horizontally:

```yaml
# docker-compose.yml
services:
  backend:
    deploy:
      replicas: 3
```

### Redis for Rate Limiting (Production)

Replace in-memory rate limiting:
```bash
npm install express-rate-limit rate-limit-redis ioredis
```

```typescript
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

const limiter = rateLimit({
  store: new RedisStore({ client: redis }),
  windowMs: 15 * 60 * 1000,
  max: 100,
});
```

## 📦 Database Setup (Supabase)

1. **Create Supabase project**
2. **Run schema:**
```bash
psql -h db.xxx.supabase.co -U postgres -d postgres -f backend/db/schema.sql
```

3. **Set environment variables:**
```
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 🔄 CI/CD

GitHub Actions workflow already configured at `.github/workflows/ci.yml`

### Add Deployment Step

```yaml
- name: Deploy to Production
  if: github.ref == 'refs/heads/main'
  run: |
    # Add your deployment script
    # Example: AWS ECS, Cloud Run, etc.
```

## 📱 Mobile App Configuration

Update frontend API URL for production:

```bash
# .env
EXPO_PUBLIC_API_URL=https://api.aariv.com
```

Build production app:
```bash
# iOS
eas build --platform ios --profile production

# Android
eas build --platform android --profile production
```

## 🆘 Troubleshooting

### Container won't start
- Check logs: `docker logs aariv-backend`
- Verify environment variables are set
- Check health endpoint: `curl http://localhost:3000/api/health`

### High memory usage
- Monitor with: `docker stats aariv-backend`
- Increase memory limit in docker-compose.yml
- Check for memory leaks in OpenAI client connections

### Rate limit errors
- Check rate limiter configuration
- Implement Redis for distributed rate limiting
- Monitor with CloudWatch/Datadog

### Database connection issues
- Verify Supabase credentials
- Check network connectivity from container
- Review Supabase connection pooling settings

---

**For support:** Check logs, monitor health endpoint, review error tracking service
