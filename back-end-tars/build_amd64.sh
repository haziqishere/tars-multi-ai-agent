#!/bin/bash

# Exit on error
set -e

echo "Building TARS Multi-Agent System Docker image for AMD64 platform..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo "Error: Docker is not running. Please start Docker and try again."
  exit 1
fi

# Set up Docker buildx for cross-platform builds if needed
if ! docker buildx ls | grep -q mybuilder; then
  echo "Setting up Docker buildx..."
  docker buildx create --name mybuilder --use
fi

# Switch to the buildx builder
docker buildx use mybuilder

# Build the Docker image with platform explicitly set to AMD64
echo "Building Docker image for AMD64..."
docker buildx build --platform=linux/amd64 \
  --output type=docker \
  -t haziqishere/tars-multi-agent:v3.1-amd64 .

echo "Verifying image architecture..."
docker inspect haziqishere/tars-multi-agent:v3.1-amd64 | grep -i architecture

echo ""
echo "Image built successfully! You can now push it to Docker Hub with:"
echo "docker push haziqishere/tars-multi-agent:v3.1-amd64"
echo ""
echo "Or run it locally with:"
echo "docker run -d -p 80:8000 haziqishere/tars-multi-agent:v3.1-amd64"