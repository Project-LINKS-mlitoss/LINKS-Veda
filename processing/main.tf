provider "google" {
  project = var.project_id
  region  = var.region
}

provider "google-beta" {
  project = var.project_id
  region  = var.region
}

terraform {
  backend "gcs" {}
}

module "infrastructure" {
  source                         = "./modules/infrastructure"
  project_id                     = var.project_id
  region                         = var.region
  aws_location_index_name        = var.aws_location_index_name
  bucket_name                    = var.bucket_name
  user_mongodb                   = var.user_mongodb
  dataset_name                   = var.dataset_name
  CMS_GET_ASSETS_TOKEN           = var.CMS_GET_ASSETS_TOKEN
  DOCUMENT_INTELLIGENCE_ENDPOINT = var.DOCUMENT_INTELLIGENCE_ENDPOINT
  DOCUMENT_INTELLIGENCE_KEY      = var.DOCUMENT_INTELLIGENCE_KEY
}

output "gateway_url" {
  value = "https://${module.infrastructure.gateway_info.default_hostname}"
}
