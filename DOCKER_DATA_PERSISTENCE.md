# Docker Data Persistence Guide

## Data Persistence Overview

The application uses Docker volumes to persist data between container restarts and rebuilds:

1. **PostgreSQL Database** (`postgres-data`) - All database data
2. **Uploaded Files** (`uploads-data`) - Recipe images, tool images, etc.

### How Data Persistence Works

```yaml
volumes:
  postgres-data:
    driver: local
  uploads-data:
    driver: local
```

**Backend Service:**
```yaml
volumes:
  - uploads-data:/app/uploads
```

**PostgreSQL Service:**
```yaml
volumes:
  - postgres-data:/var/lib/postgresql/data
```

These volumes are defined in `docker-compose.yml` and store all data permanently on the host system.

## Container Management Commands

### ✅ Safe Commands (Data is Preserved)

These commands will **keep your database data**:

```bash
# Restart containers (data preserved)
docker compose restart

# Stop containers (data preserved)
docker compose stop

# Stop and remove containers (data preserved, volumes remain)
docker compose down

# Rebuild and restart (data preserved)
docker compose up --build -d
```

### ⚠️ Dangerous Commands (Data is Lost)

These commands will **delete your database data**:

```bash
# Remove containers AND volumes (⚠️ DELETES ALL DATA)
docker compose down -v

# Remove specific volume (⚠️ DELETES ALL DATA)
docker volume rm cooking-management-system_postgres-data
```

## Best Practices

### 1. Regular Backups

Create database backups regularly:

```bash
# Backup PostgreSQL database
docker compose exec postgres pg_dump -U postgres cooking_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore from backup
docker compose exec -T postgres psql -U postgres cooking_db < backup_20240331_140000.sql
```

### 2. Development vs Production

**Development:**
- Use `docker compose down` (without `-v`) to preserve data
- Only use `docker compose down -v` when you intentionally want a fresh start

**Production:**
- Never use `docker compose down -v`
- Always create backups before updates
- Consider external backup solutions

### 3. Volume Inspection

Check if your volume exists and its size:

```bash
# List all volumes
docker volume ls

# Inspect the postgres volume
docker volume inspect cooking-management-system_postgres-data

# Check volume size
docker system df -v
```

## Troubleshooting

### Problem: Database is Empty After Rebuild

**Cause:** You used `docker compose down -v` which deleted the volume.

**Solution:**
1. Restore from backup (if available)
2. Or start fresh and re-import data

### Problem: Want to Start Fresh

**Solution:**
```bash
# Stop and remove everything including volumes
docker compose down -v

# Start fresh
docker compose up -d
```

### Problem: Volume is Corrupted

**Solution:**
```bash
# Backup current data (if possible)
docker compose exec postgres pg_dump -U postgres cooking_db > emergency_backup.sql

# Remove corrupted volume
docker compose down -v

# Start fresh and restore
docker compose up -d
sleep 10  # Wait for database to be ready
docker compose exec -T postgres psql -U postgres cooking_db < emergency_backup.sql
```

## Volume Location

Docker volumes are stored on the host system:

- **Linux:** `/var/lib/docker/volumes/`
- **macOS:** `~/Library/Containers/com.docker.docker/Data/vms/0/`
- **Windows:** `C:\ProgramData\Docker\volumes\`

The actual volume names are:
- Database: `cooking-management-system_postgres-data`
- Uploads: `cooking-management-system_uploads-data`

## Migration Between Environments

### Export Data

```bash
# Export database
docker compose exec postgres pg_dump -U postgres cooking_db > cooking_db_export.sql

# Export uploads from Docker volume
docker run --rm -v cooking-management-system_uploads-data:/data -v $(pwd):/backup alpine tar czf /backup/uploads_backup.tar.gz -C /data .
```

### Import Data

```bash
# Import database
docker compose exec -T postgres psql -U postgres cooking_db < cooking_db_export.sql

# Import uploads to Docker volume
docker run --rm -v cooking-management-system_uploads-data:/data -v $(pwd):/backup alpine tar xzf /backup/uploads_backup.tar.gz -C /data
```

### Copy Existing Uploads to Volume

If you have existing uploads in `backend/uploads/`, copy them to the new volume:

```bash
# Stop the backend container
docker compose stop backend

# Copy files from local directory to volume
docker run --rm -v $(pwd)/backend/uploads:/source -v cooking-management-system_uploads-data:/dest alpine sh -c "cp -r /source/* /dest/"

# Start the backend container
docker compose start backend
```

## Summary

- **Default behavior:** Data is preserved across container restarts and rebuilds
- **Volume names:**
  - `postgres-data` (database)
  - `uploads-data` (images and files)
- **Safe command:** `docker compose down` (without `-v`)
- **Dangerous command:** `docker compose down -v` (deletes all data)
- **Best practice:** Regular backups before any major changes
- **Migration:** Use Docker volume commands to export/import data

---

Made with Bob