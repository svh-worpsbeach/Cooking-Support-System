# Podman Machine Network Configuration for iOS Development

## Problem
Podman Machine (AppleHV) on macOS only forwards ports to `localhost` (127.0.0.1), not to all network interfaces. This prevents iOS devices on the same network from accessing the backend.

## Root Cause
Podman Machine uses `gvproxy` which by default only binds to localhost for security reasons. The `0.0.0.0` binding in docker-compose.yml only affects the container-to-host mapping inside the VM, not the host-to-network mapping.

## Solutions

### Option 1: Recreate Podman Machine with Rootful Mode (Recommended)

Rootful mode allows better network control:

```bash
# Stop and remove current machine
podman machine stop
podman machine rm podman-machine-default

# Create new rootful machine
podman machine init --rootful --now

# Verify
podman machine list
```

After recreation, restart containers:
```bash
podman-compose up -d
```

Test external access:
```bash
curl http://$(ipconfig getifaddr en0):5580/health
```

### Option 2: Modify gvproxy Configuration

Edit the Podman Machine configuration to bind gvproxy to all interfaces:

```bash
# Stop machine
podman machine stop

# Edit machine config (location varies by Podman version)
# macOS: ~/.config/containers/podman/machine/podman-machine-default.json
# or: ~/.local/share/containers/podman/machine/podman-machine-default/config.json

# Find the "PortForwardings" section and change:
# From: "HostIP": "127.0.0.1"
# To:   "HostIP": "0.0.0.0"

# Start machine
podman machine start
```

### Option 3: SSH Tunnel (Temporary Solution)

Use the provided script to create an SSH tunnel:

```bash
cd ios
./START_BACKEND_FOR_IOS.sh
```

This script:
1. Checks if backend is running
2. Gets your local IP address
3. Creates SSH tunnel: `ssh -N -L 0.0.0.0:5580:localhost:5580 localhost`
4. Keeps running (Ctrl+C to stop)

**Pros:**
- No Podman Machine changes needed
- Works immediately
- Easy to start/stop

**Cons:**
- Must keep terminal open
- Requires SSH access to localhost
- Extra process running

### Option 4: Use Podman with --network=host (Linux-style)

Not available on macOS due to VM architecture.

### Option 5: Run Backend Locally (Development)

Simplest solution for iOS development:

```bash
cd backend
source venv/bin/activate  # if using venv
./run.sh
```

Backend runs directly on macOS, accessible at `http://$(ipconfig getifaddr en0):5580`

## Verification Steps

After applying any solution, verify:

1. **Check localhost access:**
   ```bash
   curl http://localhost:5580/health
   ```
   Expected: `{"status":"healthy"}`

2. **Check external IP access:**
   ```bash
   LOCAL_IP=$(ipconfig getifaddr en0)
   curl http://$LOCAL_IP:5580/health
   ```
   Expected: `{"status":"healthy"}`

3. **Check from iOS device:**
   - Open Safari on iPhone
   - Navigate to: `http://192.168.178.65:5580/health`
   - Should see: `{"status":"healthy"}`

## Current Configuration

### docker-compose.yml
```yaml
services:
  backend:
    ports:
      - "0.0.0.0:5580:8000"  # ✅ Correct for container
```

### Podman Machine
```bash
$ podman machine list
NAME                     VM TYPE     CREATED         LAST UP            
podman-machine-default*  applehv     56 minutes ago  Currently running
```

### Port Binding Test
```bash
$ lsof -i :5580
COMMAND   PID USER   FD   TYPE             DEVICE SIZE/OFF NODE NAME
gvproxy 27967  svh   25u  IPv6 0x473ff432ecf3f7f2      0t0  TCP *:tmosms0 (LISTEN)
```

Note: `gvproxy` is listening, but only forwarding to localhost.

## Recommended Approach

For iOS development, use **Option 1 (Rootful Mode)** or **Option 5 (Local Backend)**:

### Option 1: Rootful Podman Machine
```bash
podman machine stop
podman machine rm podman-machine-default
podman machine init --rootful --now
podman-compose up -d
```

### Option 5: Local Backend
```bash
cd backend
./run.sh
```

Both approaches avoid the gvproxy limitation and provide reliable network access for iOS devices.

## Troubleshooting

### SSH Tunnel Not Working
```bash
# Check if SSH is enabled
sudo systemsetup -getremotelogin

# Enable if needed
sudo systemsetup -setremotelogin on
```

### Firewall Blocking
```bash
# Check firewall status
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate

# Allow Python (for local backend)
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add /usr/bin/python3
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --unblockapp /usr/bin/python3
```

### Port Already in Use
```bash
# Find what's using port 5580
lsof -i :5580

# Kill if needed
kill -9 <PID>
```

## References

- [Podman Machine Documentation](https://docs.podman.io/en/latest/markdown/podman-machine.1.html)
- [gvproxy GitHub](https://github.com/containers/gvisor-tap-vsock)
- [Podman Networking](https://github.com/containers/podman/blob/main/docs/tutorials/mac_win_client.md)