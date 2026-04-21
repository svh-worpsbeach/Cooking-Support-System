#!/bin/bash

# Script to make Podman backend accessible for iOS development
# This creates an SSH tunnel that forwards port 5580 to all network interfaces

echo "🚀 Starting backend for iOS development..."
echo ""

# Check if podman containers are running
if ! podman ps | grep -q "cooking-backend"; then
    echo "⚠️  Backend container not running. Starting containers..."
    podman-compose up -d
    echo "⏳ Waiting for backend to be ready..."
    sleep 10
fi

# Check if backend is healthy
if curl -s http://localhost:5580/health > /dev/null 2>&1; then
    echo "✅ Backend is running on localhost:5580"
else
    echo "❌ Backend is not responding. Check logs with: podman logs cooking-backend"
    exit 1
fi

# Get the local IP address
LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null)

if [ -z "$LOCAL_IP" ]; then
    echo "❌ Could not determine local IP address"
    exit 1
fi

echo "📱 Local IP: $LOCAL_IP"
echo ""
echo "🔧 Creating SSH tunnel to forward port 5580 to all interfaces..."
echo "   This allows iOS devices to access: http://$LOCAL_IP:5580"
echo ""
echo "⚠️  Keep this terminal window open while developing!"
echo "   Press Ctrl+C to stop the tunnel"
echo ""

# Create SSH tunnel that binds to all interfaces
# This forwards external connections on port 5580 to localhost:5580
ssh -N -L 0.0.0.0:5580:localhost:5580 localhost

# Made with Bob
