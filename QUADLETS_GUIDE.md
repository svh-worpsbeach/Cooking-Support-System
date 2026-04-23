# Podman Quadlets Guide

## ⚠️ Important: Platform Compatibility

**Quadlets require systemd and work best on Linux.**

### Platform Support:
- ✅ **Linux** - Full support with native systemd
- ⚠️ **macOS** - Limited support (systemd only available inside Podman Machine VM)
- ❌ **Windows** - Not supported (no systemd)

### Recommended Approach by Platform:
- **Linux**: Use Quadlets for production (this guide)
- **macOS**: Use `podman-compose` for development (see below)
- **Windows**: Use `podman-compose` or Docker Desktop

## What are Quadlets?

Quadlets are Podman's native integration with systemd. They allow you to manage containers as systemd services, providing:

- **Automatic startup** on boot
- **Dependency management** between containers
- **Systemd integration** for logging, monitoring, and control
- **Better resource management** through systemd cgroups
- **No compose dependency** - uses native Podman + systemd

## Why Use Quadlets Instead of Compose?

### Advantages:
- ✅ Native systemd integration (journalctl logs, systemctl control)
- ✅ Automatic startup on boot (systemd enable)
- ✅ Better dependency management
- ✅ No Python dependency (podman-compose)
- ✅ More reliable on macOS with Podman Machine
- ✅ Standard Linux service management

### Disadvantages:
- ❌ Requires systemd (not available on all systems)
- ❌ Different syntax from docker-compose
- ❌ Less familiar to Docker users

## Quick Start

### Prerequisites Check

Before using quadlets, verify systemd is available:

```bash
# Check if systemd is available
systemctl --version

# On macOS, this will fail on the host
# You would need to run it inside Podman Machine:
podman machine ssh
systemctl --version
exit
```

### 1. Install Quadlets

**On Linux:**
```bash
./quadlet-wrapper.sh install
```

**On macOS (Not Recommended):**
```bash
# Quadlets don't work well on macOS
# Use podman-compose instead:
podman-compose up -d
```

This copies quadlet files to `~/.config/systemd/user/` and reloads systemd.

### 2. Build Container Images

First, build the images using compose (one-time):

```bash
podman-compose build
```

Or build manually:

```bash
# Backend
cd backend && podman build -t localhost/cookingmanagementsystem_backend:latest .

# Frontend
cd frontend && podman build -t localhost/cookingmanagementsystem_frontend:latest .
```

### 3. Start Services

```bash
./quadlet-wrapper.sh start
```

### 4. Check Status

```bash
./quadlet-wrapper.sh status
```

### 5. View Logs

```bash
# Follow backend logs
./quadlet-wrapper.sh logs backend --follow

# View all logs
USE_QUADLETS=true ./stream-logs.sh both
```

## Quadlet Files

The project includes these quadlet files in the `quadlets/` directory:

### Network
- `cooking-network.network` - Bridge network for all containers

### Volumes
- `cooking-postgres-data.volume` - PostgreSQL data persistence
- `cooking-uploads-data.volume` - Backend uploads storage

### Containers
- `cooking-postgres.container` - PostgreSQL database
- `cooking-backend.container` - FastAPI backend
- `cooking-frontend.container` - Nginx frontend

## Management Commands

### Using quadlet-wrapper.sh

```bash
# Install quadlets to systemd
./quadlet-wrapper.sh install

# Start all services
./quadlet-wrapper.sh start

# Stop all services
./quadlet-wrapper.sh stop

# Restart services
./quadlet-wrapper.sh restart

# Show status
./quadlet-wrapper.sh status

# View logs
./quadlet-wrapper.sh logs backend
./quadlet-wrapper.sh logs backend --follow
./quadlet-wrapper.sh logs frontend -f

# Enable auto-start on boot
./quadlet-wrapper.sh enable

# Disable auto-start
./quadlet-wrapper.sh disable

# Uninstall quadlets
./quadlet-wrapper.sh uninstall
```

### Using systemctl directly

```bash
# Start individual service
systemctl --user start cooking-backend.service

# Stop service
systemctl --user stop cooking-backend.service

# Restart service
systemctl --user restart cooking-backend.service

# Check status
systemctl --user status cooking-backend.service

# Enable auto-start
systemctl --user enable cooking-backend.service

# View logs
journalctl --user -u cooking-backend.service -f
```

### Using compose-wrapper.sh with Quadlets

Set the environment variable to use quadlets:

```bash
export USE_QUADLETS=true

# Now compose-wrapper.sh will use quadlets
./compose-wrapper.sh up -d
./compose-wrapper.sh ps
./compose-wrapper.sh logs backend
./compose-wrapper.sh down
```

## Logging

### View Logs with journalctl

```bash
# Follow backend logs
journalctl --user -u cooking-backend.service -f

# View last 100 lines
journalctl --user -u cooking-backend.service -n 100

# View logs since boot
journalctl --user -u cooking-backend.service -b

# View logs for all services
journalctl --user -u cooking-*.service -f
```

### View Logs with stream-logs.sh

```bash
# Enable quadlet mode
export USE_QUADLETS=true

# Stream backend logs
./stream-logs.sh backend

# Stream both backend and frontend
./stream-logs.sh both

# Stream with custom tail lines
TAIL_LINES=200 ./stream-logs.sh backend
```

## Port Bindings

All services bind to `0.0.0.0` for external access (including iOS devices):

- **PostgreSQL**: `0.0.0.0:5532` → `5432` (container)
- **Backend**: `0.0.0.0:5580` → `8000` (container)
- **Frontend**: `0.0.0.0:5500` → `80` (container)

This allows iOS devices on the same network to access the backend at:
```
http://192.168.178.65:5580
```

## Troubleshooting

### Services won't start

```bash
# Check systemd status
systemctl --user status cooking-backend.service

# View detailed logs
journalctl --user -u cooking-backend.service -n 50

# Reload systemd daemon
systemctl --user daemon-reload
```

### Images not found

Build the images first:

```bash
cd backend && podman build -t localhost/cookingmanagementsystem_backend:latest .
cd frontend && podman build -t localhost/cookingmanagementsystem_frontend:latest .
```

### Port already in use

```bash
# Find what's using the port
lsof -i :5580

# Stop the conflicting service
systemctl --user stop cooking-backend.service
```

### Quadlets not loading

```bash
# Check quadlet files are installed
ls -la ~/.config/systemd/user/cooking-*.{container,network,volume}

# Reload systemd
systemctl --user daemon-reload

# Check for errors
systemctl --user status cooking-backend.service
```

## Switching Between Compose and Quadlets

### From Compose to Quadlets

```bash
# Stop compose services
podman-compose down

# Install and start quadlets
./quadlet-wrapper.sh install
./quadlet-wrapper.sh start
```

### From Quadlets to Compose

```bash
# Stop quadlets
./quadlet-wrapper.sh stop

# Uninstall quadlets
./quadlet-wrapper.sh uninstall

# Start compose
podman-compose up -d
```

## Auto-Start on Boot

To make services start automatically when your system boots:

```bash
# Enable services
./quadlet-wrapper.sh enable

# Or manually
systemctl --user enable cooking-postgres.service
systemctl --user enable cooking-backend.service
systemctl --user enable cooking-frontend.service

# Enable lingering (services start even when not logged in)
loginctl enable-linger $USER
```

## Updating Services

When you update code or configuration:

```bash
# Rebuild images
podman-compose build

# Or build manually
cd backend && podman build -t localhost/cookingmanagementsystem_backend:latest .

# Restart services to use new image
./quadlet-wrapper.sh restart
```

## Comparison: Compose vs Quadlets

| Feature | docker-compose / podman-compose | Podman Quadlets |
|---------|--------------------------------|-----------------|
| Syntax | YAML (docker-compose.yml) | INI-style (.container, .network, .volume) |
| Management | compose commands | systemctl commands |
| Logging | compose logs | journalctl |
| Auto-start | restart: unless-stopped | systemctl enable |
| Dependencies | depends_on | After=, Requires= |
| Health checks | healthcheck | HealthCmd, HealthInterval |
| Networking | networks | Network= |
| Volumes | volumes | Volume= |
| Port binding | ports | PublishPort= |

## macOS Specific Notes

### Why Quadlets Don't Work Well on macOS

1. **No Native systemd**: macOS doesn't have systemd
2. **Podman Machine VM**: Podman runs in a Linux VM on macOS
3. **systemd in VM**: systemd exists only inside the VM, not on the host
4. **Port Forwarding Issues**: Podman Machine uses gvproxy which only binds to localhost

### Alternative for macOS: Use podman-compose

```bash
# Install podman-compose
brew install podman-compose

# Start services
podman-compose up -d

# View logs
podman-compose logs -f

# Stop services
podman-compose down
```

### If You Really Want Quadlets on macOS

You can install quadlets inside the Podman Machine VM, but this is complex:

```bash
# SSH into Podman Machine
podman machine ssh

# Inside the VM, install quadlets manually
mkdir -p ~/.config/systemd/user
# Copy quadlet files to the VM
# Configure systemd inside the VM

# This is NOT recommended for development
```

## Best Practices

1. **Linux Production**: Use quadlets for better system integration
2. **macOS Development**: Use podman-compose for simplicity
3. **Enable lingering** (Linux only) for services that should run without login
4. **Monitor with journalctl** (Linux) or `podman-compose logs` (macOS)
5. **Use systemd timers** (Linux) for scheduled tasks instead of cron

## References

- [Podman Quadlet Documentation](https://docs.podman.io/en/latest/markdown/podman-systemd.unit.5.html)
- [systemd.unit Documentation](https://www.freedesktop.org/software/systemd/man/systemd.unit.html)
- [systemd.service Documentation](https://www.freedesktop.org/software/systemd/man/systemd.service.html)