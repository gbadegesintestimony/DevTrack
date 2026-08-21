#!/usr/bin/env bash
# ==============================================================================
# DevTrack AWS EC2 Automated Deployment & Provisioning Script
# Supported OS: Ubuntu 22.04 / 24.04 LTS
# ==============================================================================

set -euo pipefail

echo "====================================================="
echo "   🚀 Starting DevTrack AWS EC2 Provisioning"
echo "====================================================="

# 1. Update system packages
echo "▶ Updating system packages..."
sudo apt-get update -y && sudo apt-get upgrade -y

# 2. Install prerequisites & Docker if not installed
if ! command -v docker &> /dev/null; then
    echo "▶ Installing Docker & Docker Compose..."
    sudo apt-get install -y ca-certificates curl gnupg lsb-release
    sudo install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    sudo chmod a+r /etc/apt/keyrings/docker.gpg
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt-get update -y
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    sudo usermod -aG docker "$USER"
    echo "✔ Docker installed successfully."
fi

# 3. Setup environment configuration
if [ ! -f .env ]; then
    echo "▶ Generating .env file from .env.docker.example..."
    cp .env.docker.example .env
    
    # Generate secure random secrets for production
    SESSION_KEY=$(openssl rand -hex 32)
    CSRF_KEY=$(openssl rand -hex 32)
    sed -i "s/devtrack_super_secure_random_session_secret_2026_key/${SESSION_KEY}/g" .env
    sed -i "s/devtrack_super_secure_random_csrf_secret_2026_key/${CSRF_KEY}/g" .env
    echo "✔ Production secrets generated in .env"
fi

# 4. Build and run containers
echo "▶ Building and launching Docker Compose stack..."
docker compose pull || true
docker compose up -d --build

# 5. Wait for PostgreSQL to be healthy
echo "▶ Waiting for PostgreSQL database to be ready..."
until docker compose exec postgres pg_isready -U postgres -d devtrack; do
    echo "  Waiting for database connection..."
    sleep 2
done

# 6. Run Prisma Migrations inside backend container
echo "▶ Executing Prisma production database migrations..."
docker compose exec backend npx prisma migrate deploy || true

echo "====================================================="
echo "   🎉 DevTrack is LIVE and running on AWS EC2!"
echo "====================================================="
echo "▶ Frontend: http://$(curl -s http://checkip.amazonaws.com || echo 'YOUR_EC2_IP')"
echo "▶ Backend:  http://$(curl -s http://checkip.amazonaws.com || echo 'YOUR_EC2_IP'):5000/api/v1"
echo "▶ Health:   http://$(curl -s http://checkip.amazonaws.com || echo 'YOUR_EC2_IP'):5000/api/v1/health"
