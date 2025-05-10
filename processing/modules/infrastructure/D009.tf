variable "path_D009" {
  default = "./cloud_function/D009"
}

locals {
  dataset_name = {
    DATASET_NAME = "${var.dataset_name}"
  }
}

locals {
  vectorize-event-job_info = {
    PROJECT_ID         = var.project_id
    REGION             = var.region
    VECTORIZE_JOB_NAME = "vectorize-event-job"
  }
}

locals {
  functions_trigger_http_d009 = [
    {
      name                  = "vectorize",
      file                  = "vectorize.zip",
      entry                 = "vectorize",
      sa                    = "vectorize",
      source                = var.path_D009,
      environment_variables = merge(local.db_info, local.vectorize-event-job_info)
    },
    {
      name                  = "chatbot",
      file                  = "chatbot.zip",
      entry                 = "chatbot",
      sa                    = "chatbot",
      source                = var.path_D009,
      environment_variables = merge(local.db_info, local.project_id, local.dataset_name, local.region)
    },
    {
      name   = "columns-translate",
      file   = "columns-translate.zip",
      entry  = "columns_translate",
      sa     = "columns-translate",
      source = var.path_D009
    }
  ]

  cloud_run_job_d009 = [
    {
      name       = "vectorize-event-job"
      job_name   = "vectorize-event-job"
      sa         = "vectorize-event"
      folder     = "cloud_function/D009/vectorize-event-job/**"
      context    = "cloud_function/D009/vectorize-event-job"
      image_name = "${var.region}-docker.pkg.dev/${var.project_id}/links-veda/vectorize-event-job:latest"
      enviroment = merge(local.db_info, local.project_id, local.dataset_name, local.region, local.cms_get_assets_token)
    }
  ]

  functions_d009 = local.functions_trigger_http_d009
}

# Create Service Account for HTTP-triggered Cloud Functions
data "google_service_account" "function_sa_for_http_d009" {
  for_each = { for func in local.functions_trigger_http_d009 : func.name => func }

  account_id = each.value.sa
}

# Create Service Account for Cloud Run Jobs
data "google_service_account" "function_sa_for_job_d009" {
  for_each = { for func in local.cloud_run_job_d009 : func.name => func }

  account_id = each.value.sa
}

# Combine all service accounts into a single map
locals {
  all_service_accounts_d009 = merge(
    data.google_service_account.function_sa_for_http_d009,
    data.google_service_account.function_sa_for_job_d009
  )

  # List of roles to assign
  roles_d009 = ["roles/run.invoker"]

  # Create a mapping between service accounts and roles
  sa_roles_map_d009 = {
    for pair in setproduct(keys(local.all_service_accounts_d009), local.roles_d009) :
    "${pair[0]}-${pair[1]}" => {
      sa_email = local.all_service_accounts_d009[pair[0]].email
      role     = pair[1]
    }
  }
}

resource "google_cloud_run_v2_job" "dms-all-job-d009" {
  for_each            = { for job in local.cloud_run_job_d009 : job.name => job }
  name                = each.value.job_name
  location            = var.region
  deletion_protection = false
  template {
    template {
      containers {
        image = each.value.image_name
        dynamic "env" {
          for_each = { for key, value in each.value.enviroment : key => value }
          content {
            name  = env.key
            value = env.value
          }
        }
        env {
          name  = "DMS_DATA"
          value = ""
        }
        env {
          name = "PASSWORD_MONGODB"
          value_source {
            secret_key_ref {
              secret  = "mongodb-password"
              version = "latest"
            }
          }
        }
        env {
          name = "MONGO_CLIENT"
          value_source {
            secret_key_ref {
              secret  = "mongodb-database-url"
              version = "latest"
            }
          }
        }
        dynamic "env" {
          for_each = each.value.name == "vectorize-event-job" ? local.secret_environment_variables_llm_doc_structure : []
          content {
            name = env.value.key
            value_source {
              secret_key_ref {
                secret  = env.value.secret
                version = env.value.version
              }
            }
          }
        }

        resources {
          limits = {
            cpu    = "4"
            memory = "16384Mi"
          }
        }
      }
      vpc_access {
        network_interfaces {
          network    = "default"
          subnetwork = "default"
        }
        egress = "PRIVATE_RANGES_ONLY"
      }
      timeout         = "86400s"
      max_retries     = 0
      service_account = data.google_service_account.function_sa_for_job_d009[each.key].email
    }
  }

  lifecycle {
    ignore_changes = [
      client,
      client_version,
      template[0].template[0].containers[0].image,
    ]
  }
}

data "archive_file" "source_d009" {
  type = "zip"
  for_each = {
    for func in local.functions_d009 : func.name => {
      source_dir  = "${func.source}/${func.name}"
      output_path = "${func.source}/${func.file}"
    }
  }
  source_dir  = each.value.source_dir
  output_path = each.value.output_path
}

resource "google_storage_bucket_object" "objects_d009" {
  for_each = {
    for func in local.functions_d009 : func.name => {
      name   = func.file
      bucket = google_storage_bucket.bucket.name
      source = data.archive_file.source_d009[func.name].output_path
      hash   = replace(data.archive_file.source_d009[func.name].output_base64sha256, "/", "$")
    }
  }
  name   = "${each.value.name}-${each.value.hash}.zip"
  bucket = each.value.bucket
  source = each.value.source
}

resource "google_cloudfunctions2_function" "function_d009" {
  for_each = {
    for func in local.functions_trigger_http_d009 : func.name => func
  }
  name        = each.value.name
  location    = var.region
  description = "a new function"

  build_config {
    runtime     = "python312"
    entry_point = each.value.entry # Set the entry point
    source {
      storage_source {
        bucket = google_storage_bucket.bucket.name
        object = google_storage_bucket_object.objects_d009[each.value.name].name
      }
    }
  }

  service_config {
    available_memory      = each.value.name == "chatbot" ? "2048M" : "512M"
    timeout_seconds       = 540
    service_account_email = data.google_service_account.function_sa_for_http_d009[each.key].email

    dynamic "secret_environment_variables" {
      for_each = each.value.name == "chatbot" || each.value.name == "columns_translate" ? [1] : []
      content {
        project_id = var.project_id
        key        = "AWS_ACCESS_KEY_ID"
        secret     = "aws-access-key"
        version    = "latest"
      }
    }

    dynamic "secret_environment_variables" {
      for_each = each.value.name == "chatbot" || each.value.name == "columns_translate" ? [1] : []
      content {
        project_id = var.project_id
        key        = "AWS_SECRET_ACCESS_KEY"
        secret     = "aws-secret-key"
        version    = "latest"
      }
    }
    secret_environment_variables {
      project_id = var.project_id
      key        = "PASSWORD_MONGODB"
      secret     = "mongodb-password"
      version    = "latest"
    }
    secret_environment_variables {
      project_id = var.project_id
      key        = "MONGO_CLIENT"
      secret     = "mongodb-database-url"
      version    = "latest"
    }
    environment_variables = lookup(each.value, "environment_variables", {})
  }
}
