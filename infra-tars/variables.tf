# variables.tf - Create this file in your infra-tars folder

variable "resource_group_location" {
  default     = "East US"
  description = "Location of the resource group."
}

variable "resource_group_name" {
  default     = "tars-resources"
  description = "Name of the resource group."
}

variable "vm_size" {
  default     = "Standard_B2s"
  description = "Size of the virtual machine."
}

variable "admin_username" {
  default     = "azureuser"
  description = "Username for the virtual machine."
}

variable "ssh_public_key_path" {
  default     = "~/.ssh/tars_azure.pub"
  description = "Path to the SSH public key."
}

variable "docker_image" {
  description = "Docker image to run on the VM"
  default     = "haziqishere/tars-multi-agent:latest"
}
