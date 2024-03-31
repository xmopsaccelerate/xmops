# Variable declarations for customization
variable "instance_name" {
  description = "Name of the Lightsail instance"
  type        = string
  default     = "WordPressInstance"
}

variable "availability_zone" {
  description = "The Availability Zone in which to create the instance"
  type        = string
  default     = "us-east-1a"
}

variable "blueprint_id" {
  description = "The ID for a virtual private server image (blueprint)"
  type        = string
  default     = "wordpress" # This ID specifies the WordPress blueprint on Lightsail
}

variable "bundle_id" {
  description = "The bundle of hardware and software for the instance"
  type        = string
  default     = "nano_2_0" # This specifies the smallest available plan on Lightsail
}
