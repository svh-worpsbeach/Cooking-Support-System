# Network Access Configuration Guide

## Problem: Browser Cannot Resolve Docker Container Hostnames

When accessing the application from a browser (especially from LAN), the browser cannot resolve Docker internal hostnames like `backend` or `postgres`. This is because Docker's internal DNS only works within the Docker network, not from external clients.

## Solution: Use Host IP Address

The frontend needs to be built with the **host machine's IP address** instead of Docker container hostnames.

### Current Configuration

All docker-compose files now use the host IP address `192.168.178.88` for the backend API:

```yaml
frontend:
  build:
    context: ./frontend
    args:
      - VITE_API_URL=http://192.168.178.88:5580
```

### Access Points

| Database | Frontend URL | Backend URL | Database Port |
|----------|-------------|-------------|---------------|
| PostgreSQL | http://192.168.178.88:5500 | http://192.168.178.88:5580 | 5532 |
| DB2 | http://192.168.178.88:5501 | http://192.168.178.88:5580 | 5500 |
| SQLite | http://192.168.178.88:5502 | http://192.168.178.88:5580 | N/A |

### How It Works

1. **Build Time**: Frontend is built with `VITE_API_URL=http://192.168.178.88:5580`
2. **Runtime**: Browser makes API requests to `http://192.168.178.88:5580`
3. **Docker Network**: Backend can still communicate with databases using container hostnames

## Changing the IP Address

If your host IP changes, update the `VITE_API_URL` in all docker-compose files:

### Files to Update

1. `docker-compose.yml` (PostgreSQL)
2. `docker-compose.db2.yml` (DB2)
3. `docker-compose.dev.yml` (SQLite)

### Example

```yaml
frontend:
  build:
    context: ./frontend
    args:
      - VITE_API_URL=http://YOUR_NEW_IP:5580  # Change this
```

### Rebuild After Changes

```bash
docker-compose down
docker-compose up -d --build
```

## CORS Configuration

The backend CORS is configured to allow all origins:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,  # Must be False with wildcard
    allow_methods=["*"],
    allow_headers=["*"],
)
```

This allows access from any IP address or hostname.

## Troubleshooting

### Frontend Shows "Failed to fetch"

1. Check if backend is running: `curl http://192.168.178.88:5580/health`
2. Check browser console for CORS errors
3. Verify `VITE_API_URL` in frontend build: `docker-compose logs frontend | grep VITE_API_URL`

### Backend Not Accessible

1. Check if backend container is running: `docker-compose ps`
2. Check backend logs: `docker-compose logs backend`
3. Verify port mapping: `docker-compose ps backend`

### Database Connection Issues

1. Check database container: `docker-compose ps postgres` (or `db2`)
2. Check database logs: `docker-compose logs postgres`
3. Verify connection from backend: `docker-compose logs backend | grep -i database`

## Network Architecture

```
Browser (192.168.178.88:5500)
    ↓ HTTP
Frontend Container (port 5500)
    ↓ HTTP (192.168.178.88:5580)
Backend Container (port 5580)
    ↓ Docker Network (hostname: postgres)
Database Container (port 5532 → 5432)
```

## Alternative: Using Localhost

For local development on the same machine, you can use `localhost` instead:

```yaml
- VITE_API_URL=http://localhost:5580
```

This works when accessing from `http://localhost:5500` but **not** from LAN IP addresses.

## Best Practice

For production deployments:
1. Use environment variables for the API URL
2. Configure reverse proxy (nginx) to handle routing
3. Use proper domain names instead of IP addresses
4. Enable HTTPS with SSL certificates

---

*Made with Bob*