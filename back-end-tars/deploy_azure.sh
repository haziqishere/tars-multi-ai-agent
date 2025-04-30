#!/bin/bash
# Azure VM deployment script for TARS Multi-AI Agent

set -e

echo "=== Starting TARS Multi-AI Agent Deployment ==="

# Update package list
echo "Updating package list..."
sudo apt-get update

# Install Docker if not installed
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    sudo apt-get install -y apt-transport-https ca-certificates curl software-properties-common
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
    sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
    sudo apt-get update
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io
    sudo systemctl enable docker
    sudo systemctl start docker
    sudo usermod -aG docker $USER
fi

# Install Docker Compose if not installed
if ! command -v docker-compose &> /dev/null; then
    echo "Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.23.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Create required directories
echo "Setting up directories..."
mkdir -p logs data

# Check if .env file exists, if not, create from sample
if [ ! -f .env ]; then
    echo "Creating .env file from sample..."
    if [ -f .env.sample ]; then
        cp .env.sample .env
        echo "Please edit .env file with your actual configuration values."
    else
        echo "ERROR: .env.sample file not found. Please create .env file manually."
        exit 1
    fi
fi

# Build and start the containers
echo "Building and starting containers..."
docker-compose up -d

echo "=== TARS Multi-AI Agent Deployment Complete ==="
echo "The API should now be accessible at http://localhost:8000"
echo "Note: You may need to configure Azure VM networking to expose this port."
echo "To check logs: docker-compose logs -f"