# Create a new SSH key pair for the Lightsail instance
resource "aws_lightsail_key_pair" "my_key_pair" {
  name_prefix = "lightsail-"
}

# Deploy a new Lightsail instance with WordPress
resource "aws_lightsail_instance" "wordpress_instance" {
  name              = var.instance_name
  availability_zone = var.availability_zone
  blueprint_id      = var.blueprint_id
  bundle_id         = var.bundle_id
  key_pair_name     = aws_lightsail_key_pair.my_key_pair.name

  tags = {
    Name = "WordPressServer"
  }
}
