# Deployment Instructions - Instana Config Pilot

## Prerequisites

Before deploying the application, ensure you have the following installed:

- **Docker** 20.10+ and **Docker Compose** 2.0+
- **Node.js** 18+ and **npm** (for local development)
- **Python** 3.11+ (for local development)

## Quick Start with Docker (Recommended)

The easiest way to run the application is using Docker Compose:

```bash
# 1. Clone the repository
git clone <repository-url>
cd instana_config_pilot

# 2. Build and start the containers
docker-compose up --build

# 3. Access the application
# Frontend: http://localhost:80
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

## Local Development Setup

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the backend server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The backend will be available at http://localhost:8000

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

The frontend will be available at http://localhost:5173

## Building for Production

### Frontend Build

```bash
cd frontend
npm install
npm run build
```

The production build will be in the `frontend/dist` directory.

### Backend Build

The backend doesn't require a build step, but you can create a Docker image:

```bash
cd backend
docker build -t instana-config-backend .
```

## Docker Deployment

### Using Docker Compose (Recommended)

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild after code changes
docker-compose up --build
```

### Manual Docker Commands

**Backend:**
```bash
cd backend
docker build -t instana-config-backend .
docker run -d -p 8000:8000 --name backend instana-config-backend
```

**Frontend:**
```bash
cd frontend
docker build -t instana-config-frontend .
docker run -d -p 80:80 --name frontend instana-config-frontend
```

## Environment Variables

Create a `.env` file in the project root (copy from `.env.example`):

```env
# Backend Configuration
ENVIRONMENT=production
LOG_LEVEL=info
BACKEND_PORT=8000

# Frontend Configuration
VITE_API_URL=http://localhost:8000

# CORS Configuration
CORS_ORIGINS=http://localhost:5173,http://localhost:80,http://localhost:3000

# File Upload Configuration
MAX_UPLOAD_SIZE=10485760
ALLOWED_EXTENSIONS=.yaml,.yml
```

## Health Checks

- **Backend Health**: http://localhost:8000/health
- **Frontend Health**: http://localhost:80

## Troubleshooting

### Port Already in Use

If ports 80 or 8000 are already in use, modify the `docker-compose.yml`:

```yaml
services:
  backend:
    ports:
      - "8001:8000"  # Change 8000 to 8001
  
  frontend:
    ports:
      - "8080:80"    # Change 80 to 8080
```

### Docker Build Fails

1. Ensure Docker is running
2. Check Docker has enough resources (memory, disk space)
3. Try cleaning Docker cache:
   ```bash
   docker system prune -a
   ```

### Frontend Can't Connect to Backend

1. Check backend is running: `docker-compose ps`
2. Verify CORS settings in `backend/app/main.py`
3. Check network connectivity: `docker network ls`

### npm install Fails

If you don't have Node.js/npm installed:

1. **Download Node.js**: https://nodejs.org/ (LTS version recommended)
2. **Verify installation**:
   ```bash
   node --version
   npm --version
   ```
3. **Retry npm install**:
   ```bash
   cd frontend
   npm install
   ```

## Production Deployment

### Using Docker Compose in Production

```bash
# Set environment to production
export ENVIRONMENT=production

# Build and start services
docker-compose up -d

# Monitor logs
docker-compose logs -f --tail=100
```

### Using a Reverse Proxy (Nginx)

For production, it's recommended to use a reverse proxy:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### SSL/TLS Configuration

For HTTPS, use Let's Encrypt with Certbot:

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal is configured automatically
```

## Monitoring

### Docker Container Logs

```bash
# View all logs
docker-compose logs

# Follow logs in real-time
docker-compose logs -f

# View specific service logs
docker-compose logs backend
docker-compose logs frontend
```

### Container Stats

```bash
# View resource usage
docker stats

# View specific container
docker stats backend frontend
```

## Backup and Restore

### Backup Configuration Files

```bash
# Backup uploaded files
docker cp backend:/app/uploads ./backup/uploads

# Backup temporary files
docker cp backend:/app/temp ./backup/temp
```

### Restore Configuration Files

```bash
# Restore uploaded files
docker cp ./backup/uploads backend:/app/uploads

# Restore temporary files
docker cp ./backup/temp backend:/app/temp
```

## Updating the Application

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart containers
docker-compose down
docker-compose up --build -d

# Verify services are running
docker-compose ps
```

## Security Considerations

1. **Change default ports** in production
2. **Use environment variables** for sensitive data
3. **Enable HTTPS** with SSL/TLS certificates
4. **Implement rate limiting** on the API
5. **Regular security updates** for dependencies
6. **Backup regularly** uploaded configurations

## Performance Optimization

1. **Use Docker volumes** for persistent data
2. **Enable caching** in nginx
3. **Optimize Docker images** (multi-stage builds already implemented)
4. **Monitor resource usage** and scale as needed
5. **Use CDN** for static assets in production

## Support

For issues or questions:
- Check the logs: `docker-compose logs`
- Review the documentation in `/docs`
- Open an issue on GitHub

---

**Note**: The application is designed to run in Docker containers. For the best experience, use Docker Compose for deployment.