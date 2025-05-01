output "resource_group_name" {
  value = azurerm_resource_group.tars_rg.name
}

output "vm_public_ip_address" {
  value = azurerm_public_ip.tars_public_ip.ip_address
}

output "vm_ssh_command" {
  value = "ssh ${var.admin_username}@${azurerm_public_ip.tars_public_ip.ip_address}"
}
