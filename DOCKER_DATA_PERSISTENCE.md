# Docker Data Persistence Guide

## PostgreSQL Data Persistence

The PostgreSQL database uses a Docker volume (`postgres-data`) to persist data between container restarts and rebuilds.

### How Data Persistence Works

```yaml
volumes:
  - postgres-data:/var/lib/postgresql/data
```

This volume is defined in `docker-compose.yml` and stores all PostgreSQL data permanently on the host system.

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

The actual volume name is: `cooking-management-system_postgres-data`

## Migration Between Environments

### Export Data

```bash
# Export database
docker compose exec postgres pg_dump -U postgres cooking_db > cooking_db_export.sql

# Export uploads
tar -czf uploads_backup.tar.gz backend/uploads/
```

### Import Data

```bash
# Import database
docker compose exec -T postgres psql -U postgres cooking_db < cooking_db_export.sql

# Import uploads
tar -xzf uploads_backup.tar.gz
```

## Summary

- **Default behavior:** Data is preserved across container restarts and rebuilds
- **Volume name:** `postgres-data` (defined in docker-compose.yml)
- **Safe command:** `docker compose down` (without `-v`)
- **Dangerous command:** `docker compose down -v` (deletes all data)
- **Best practice:** Regular backups before any major changes

---

Made with Bob