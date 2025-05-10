variable "project_id" {
  description = "GCP project ID"
}

variable "region" {
  description = "GCP region"
}

variable "bucket_name" {
  description = "Bucket name"
}

variable "aws_location_index_name" {
  default = ""
}

variable "user_mongodb" {
  default = ""
}

variable "dataset_name" {
  default = ""
}

variable "CMS_GET_ASSETS_TOKEN" {
  default = ""
}

variable "DOCUMENT_INTELLIGENCE_ENDPOINT" {
  default = ""
}

variable "DOCUMENT_INTELLIGENCE_KEY" {
  default = ""
}