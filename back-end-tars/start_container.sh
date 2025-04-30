#!/bin/bash

# Exit on error
set -e

echo "Starting TARS Multi-Agent System in Docker..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo "Error: Docker is not running. Please start Docker and try again."
  exit 1
fi

# Build the Docker image
echo "Building Docker image..."
docker-compose build --no-cache

# Start the services
echo "Starting services..."
docker-compose up -d

# Display container status
echo "Container status:"
docker-compose ps

echo ""
echo "The TARS Multi-Agent System API is now running!"
echo "You can access it at: http://localhost:8000/docs"
echo ""
echo "To view logs: docker-compose logs -f"
echo "To stop the services: docker-compose down"