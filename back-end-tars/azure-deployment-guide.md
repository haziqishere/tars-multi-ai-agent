# Azure VM Deployment Guide for TARS Multi-AI Agent

This guide will help you deploy the TARS Multi-AI Agent system on an Azure VM.

## Prerequisites

1. An Azure account with permission to create VMs
2. Basic familiarity with Linux commands
3. Your Azure OpenAI API credentials

## Step 1: Create an Azure VM

1. Log in to the Azure portal (https://portal.azure.com/)
2. Create a new VM with:
   - Ubuntu Server 20.04 LTS or newer
   - At least 8 GB RAM and 2 vCPUs
   - Standard SSD or Premium SSD
   - Allow inbound ports: SSH (22), HTTP (80), HTTPS (443), and your application port (8000)

## Step 2: Connect to Your VM

```bash
ssh username@your-vm-ip-address
```

## Step 3: Clone Your Repository

```bash
git clone <your-repository-url>
cd tars-multi-ai-agent/back-end-tars
```

## Step 4: Configure Environment Variables

1. Create your `.env` file based on the `.env.sample`:

```bash
cp .env.sample .env
nano .env  # Or your preferred editor
```

2. Update the following variables with your actual values:
   - AZURE_OPENAI_API_KEY
   - AZURE_OPENAI_ENDPOINT
   - AZURE_DEPLOYMENT_NAME
   - Other configuration options specific to your deployment

## Step 5: Run the Deployment Script

```bash
chmod +x deploy_azure.sh
./deploy_azure.sh
```

## Step 6: Configure Networking

1. Set up proper network security:
   - Make sure port 8000 is open in your Azure Network Security Group
   - Consider setting up HTTPS with a reverse proxy like Nginx

## Step 7: Verify Deployment

1. Check if the containers are running:
```bash
docker ps
```

2. Check the application logs:
```bash
docker-compose logs -f
```

3. Test the API endpoint:
```bash
curl http://localhost:8000/health
```

## Troubleshooting

1. If containers fail to start, check the logs:
```bash
docker-compose logs
```

2. If the API is unreachable, verify:
   - The container is running
   - Port 8000 is open in both the Azure Network Security Group and the VM's firewall
   - The application started without errors

3. For permission issues:
```bash
sudo chown -R $USER:$USER .
chmod -R 755 .
```

## Monitoring and Maintenance

1. Set up log rotation:
```bash
sudo apt-get install logrotate
```

2. Consider setting up monitoring with Azure Monitor:
   - Enable Azure Monitor for your VM
   - Set up alerts for high CPU/memory usage

3. Regular updates:
```bash
git pull
docker-compose build --no-cache
docker-compose up -d
```

## Security Considerations

1. Never store sensitive credentials directly in your Dockerfile or docker-compose.yml
2. Use a dedicated service account with minimal permissions
3. Consider using Azure Key Vault for storing secrets
4. Implement proper network security policies