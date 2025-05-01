# main.tf - Create this file in your infra-tars folder

# Resource Group
resource "azurerm_resource_group" "tars_rg" {
  name     = var.resource_group_name
  location = var.resource_group_location
}

# Virtual Network
resource "azurerm_virtual_network" "tars_vnet" {
  name                = "tars-network"
  address_space       = ["10.0.0.0/16"]
  location            = azurerm_resource_group.tars_rg.location
  resource_group_name = azurerm_resource_group.tars_rg.name
}

# Subnet
resource "azurerm_subnet" "tars_subnet" {
  name                 = "tars-subnet"
  resource_group_name  = azurerm_resource_group.tars_rg.name
  virtual_network_name = azurerm_virtual_network.tars_vnet.name
  address_prefixes     = ["10.0.1.0/24"]
}

# Public IP Address
resource "azurerm_public_ip" "tars_public_ip" {
  name                = "tars-public-ip"
  location            = azurerm_resource_group.tars_rg.location
  resource_group_name = azurerm_resource_group.tars_rg.name
  allocation_method   = "Static" # Static to ensure it doesn't change
}

# Network Security Group and Rules
resource "azurerm_network_security_group" "tars_nsg" {
  name                = "tars-nsg"
  location            = azurerm_resource_group.tars_rg.location
  resource_group_name = azurerm_resource_group.tars_rg.name

  # Allow HTTP
  security_rule {
    name                       = "HTTP"
    priority                   = 1001
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "80"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }

  # Allow HTTPS
  security_rule {
    name                       = "HTTPS"
    priority                   = 1002
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "443"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }

  # Allow SSH (for administrative access)
  security_rule {
    name                       = "SSH"
    priority                   = 1003
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "22"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }
}

# Network Interface
resource "azurerm_network_interface" "tars_nic" {
  name                = "tars-nic"
  location            = azurerm_resource_group.tars_rg.location
  resource_group_name = azurerm_resource_group.tars_rg.name

  ip_configuration {
    name                          = "internal"
    subnet_id                     = azurerm_subnet.tars_subnet.id
    private_ip_address_allocation = "Dynamic"
    public_ip_address_id          = azurerm_public_ip.tars_public_ip.id
  }
}

# Connect the Network Interface to the Network Security Group
resource "azurerm_network_interface_security_group_association" "tars_nic_nsg_association" {
  network_interface_id      = azurerm_network_interface.tars_nic.id
  network_security_group_id = azurerm_network_security_group.tars_nsg.id
}

# Virtual Machine
resource "azurerm_linux_virtual_machine" "tars_vm" {
  name                = "tars-vm"
  resource_group_name = azurerm_resource_group.tars_rg.name
  location            = azurerm_resource_group.tars_rg.location
  size                = var.vm_size
  admin_username      = var.admin_username
  network_interface_ids = [
    azurerm_network_interface.tars_nic.id,
  ]

  admin_ssh_key {
    username   = var.admin_username
    public_key = file(var.ssh_public_key_path)
  }

  os_disk {
    caching              = "ReadWrite"
    storage_account_type = "Standard_LRS"
  }

  source_image_reference {
    publisher = "Canonical"
    offer     = "UbuntuServer"
    sku       = "18.04-LTS"
    version   = "latest"
  }

  custom_data = base64encode(<<-EOF
    #!/bin/bash
    # Install Docker
    apt-get update
    apt-get install -y apt-transport-https ca-certificates curl software-properties-common
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -
    add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
    apt-get update
    apt-get install -y docker-ce docker-ce-cli containerd.io
    systemctl enable docker
    systemctl start docker
    
    # Pull and run your Docker image (replace with your actual image)
    # docker pull your-registry/your-tars-backend-image:latest
    # docker run -d -p 80:80 your-registry/your-tars-backend-image:latest
    EOF
  )
}
