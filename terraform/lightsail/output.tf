output "WordPress_URL" {
  value = aws_lightsail_instance.wordpress_instance.public_ip_address
}
