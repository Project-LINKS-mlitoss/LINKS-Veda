variable "path_structure" {
  default = "./cloud_function/D001/structure"
}

variable "path_preprocess" {
  default = "./cloud_function/D001/preprocess"
}

variable "path_D002" {
  default = "./cloud_function/D002"
}

variable "path_root" {
  default = "./cloud_function"
}

locals {
  db_info = {
    MONGO_DB         = "dms"
    MONGO_COLLECTION = "tickets"
    USER_AUTH        = var.user_mongodb
  }
}

locals {
  aws_location_info = {
    AWS_LOCATION_SERVICE_API_ENDPOINT = "https://places.geo.ap-northeast-1.amazonaws.com/places/v0/indexes/${var.aws_location_index_name}/search/text?key="
  }
}

locals {
  document_intelligence_info = {
    DOCUMENT_INTELLIGENCE_ENDPOINT = var.DOCUMENT_INTELLIGENCE_ENDPOINT
    DOCUMENT_INTELLIGENCE_KEY      = var.DOCUMENT_INTELLIGENCE_KEY
  }
}


locals {
  cms_get_assets_token = {
    CMS_GET_ASSETS_TOKEN = var.CMS_GET_ASSETS_TOKEN
  }
}

locals {
  entry_struct_job_info = {
    PROJECT_ID              = var.project_id
    REGION                  = var.region
    DATA_CLEANSING_JOB_NAME = "data-cleansing-job"
  }
  entry_unstruct_job_info = {
    PROJECT_ID         = var.project_id
    REGION             = var.region
    STRUCTURE_JOB_NAME = "structure-job"
  }
  create_rdf_event_job_info = {
    PROJECT_ID          = var.project_id
    REGION              = var.region
    CREATE_RDF_JOB_NAME = "create-rdf-event-job"
  }
  cross-event-job_info = {
    PROJECT_ID     = var.project_id
    REGION         = var.region
    CROSS_JOB_NAME = "cross-event-job"
  }
  masking_data_job_info = {
    PROJECT_ID            = var.project_id
    REGION                = var.region
    MASKING_DATA_JOB_NAME = "masking-data-event-job"
  }
  spatial_aggregate_job_info = {
    PROJECT_ID                 = var.project_id
    REGION                     = var.region
    SPATIAL_AGGREGATE_JOB_NAME = "spatial-aggregate-event-job"
  }
  spatial_join_job_info = {
    PROJECT_ID            = var.project_id
    REGION                = var.region
    SPATIAL_JOIN_JOB_NAME = "spatial-join-event-job"
  }
  text_match_job_info = {
    PROJECT_ID          = var.project_id
    REGION              = var.region
    TEXT_MATCH_JOB_NAME = "text-match-event-job"
  }
}

locals {
  functions_trigger_http = [
    {
      name                  = "entry-unstruct-data",
      file                  = "entry-unstruct-data.zip",
      entry                 = "entry_unstruct_data",
      sa                    = "entry-unstruct-data",
      source                = var.path_structure,
      environment_variables = merge(local.db_info, local.entry_unstruct_job_info)
    },
    {
      name                  = "entry-struct-data",
      file                  = "entry-struct-data.zip",
      entry                 = "entry_struct_data",
      sa                    = "entry-struct-data",
      source                = var.path_preprocess,
      environment_variables = merge(local.db_info, local.entry_struct_job_info, local.cms_get_assets_token)
    },
    {
      name                  = "suggest-schema-structure",
      file                  = "suggest-schema-structure.zip",
      entry                 = "suggest_schema_structure",
      sa                    = "suggest-schema-structure",
      source                = var.path_preprocess,
      environment_variables = merge(local.document_intelligence_info, local.cms_get_assets_token)
    },
    {
      name                  = "polling-status",
      file                  = "polling-status.zip",
      entry                 = "polling_status",
      sa                    = "polling-status",
      source                = var.path_root,
      environment_variables = local.db_info
    },
    {
      name                  = "text-match",
      file                  = "text-match.zip",
      entry                 = "text_match",
      sa                    = "text-match",
      source                = var.path_D002,
      environment_variables = merge(local.db_info, local.text_match_job_info)
    },
    {
      name                  = "spatial-join",
      file                  = "spatial-join.zip",
      entry                 = "spatial_join",
      sa                    = "spatial-join",
      source                = var.path_D002,
      environment_variables = merge(local.db_info, local.spatial_join_job_info)
    },
    {
      name                  = "spatial-aggregate",
      file                  = "spatial-aggregate.zip",
      entry                 = "spatial_aggregate",
      sa                    = "spatial-aggregate",
      source                = var.path_D002,
      environment_variables = merge(local.db_info, local.spatial_aggregate_job_info)
    },
    {
      name                  = "cross",
      file                  = "cross.zip",
      entry                 = "cross",
      sa                    = "cross-function", # Added suffix to conform to service account name should be longer than 6 characters.
      source                = var.path_D002,
      environment_variables = merge(local.db_info, local.cross-event-job_info)
    },
    {
      name                  = "masking-data",
      file                  = "masking-data.zip",
      entry                 = "masking_data",
      sa                    = "masking-data",
      source                = var.path_D002,
      environment_variables = merge(local.db_info, local.masking_data_job_info)
    },
    {
      name                  = "create-rdf",
      file                  = "create-rdf.zip",
      entry                 = "create_rdf",
      sa                    = "create-rdf",
      source                = var.path_D002,
      environment_variables = merge(local.db_info, local.create_rdf_event_job_info, local.cms_get_assets_token)
    }
  ]

  cloud_run_job = [
    {
      name       = "structure-job"
      job_name   = "structure-job"
      sa   = "structure-job"
      folder     = "cloud_function/D001/structure/structure-job/**"
      context    = "cloud_function/D001/structure/structure-job"
      image_name = "${var.region}-docker.pkg.dev/${var.project_id}/links-veda/structure-job:latest"
      enviroment = merge(local.db_info, local.document_intelligence_info, local.cms_get_assets_token)
    },
    {
      name       = "data-cleansing-job"
      job_name   = "data-cleansing-job"
      sa   = "data-cleansing"
      folder     = "cloud_function/D001/preprocess/data-cleansing-job/**"
      context    = "cloud_function/D001/preprocess/data-cleansing-job"
      image_name = "${var.region}-docker.pkg.dev/${var.project_id}/links-veda/data-cleansing-job:latest"
      enviroment = merge(local.db_info, local.aws_location_info)
    },
    {
      name       = "cross-event-job"
      job_name   = "cross-event-job"
      sa   = "cross-event"
      folder     = "cloud_function/D002/cross-event-job/**"
      context    = "cloud_function/D002/cross-event-job"
      image_name = "${var.region}-docker.pkg.dev/${var.project_id}/links-veda/cross-event-job:latest"
      enviroment = merge(local.db_info, local.cms_get_assets_token)
    },
    {
      name       = "masking-data-event-job"
      job_name   = "masking-data-event-job"
      sa   = "masking-data-event"
      folder     = "cloud_function/D002/masking-data-event-job/**"
      context    = "cloud_function/D002/masking-data-event-job"
      image_name = "${var.region}-docker.pkg.dev/${var.project_id}/links-veda/masking-data-event-job:latest"
      enviroment = merge(local.db_info, local.cms_get_assets_token)
    },
    {
      name       = "spatial-aggregate-event-job"
      job_name   = "spatial-aggregate-event-job"
      sa   = "spatial-aggregate-event"
      folder     = "cloud_function/D002/spatial-aggregate-event-job/**"
      context    = "cloud_function/D002/spatial-aggregate-event-job"
      image_name = "${var.region}-docker.pkg.dev/${var.project_id}/links-veda/spatial-aggregate-event-job:latest"
      enviroment = merge(local.db_info, local.cms_get_assets_token)
    },
    {
      name       = "spatial-join-event-job"
      job_name   = "spatial-join-event-job"
      sa   = "spatial-join-event"
      folder     = "cloud_function/D002/spatial-join-event-job/**"
      context    = "cloud_function/D002/spatial-join-event-job"
      image_name = "${var.region}-docker.pkg.dev/${var.project_id}/links-veda/spatial-join-event-job:latest"
      enviroment = merge(local.db_info, local.cms_get_assets_token)
    },
    {
      name       = "text-match-event-job"
      job_name   = "text-match-event-job"
      sa   = "text-match-event"
      folder     = "cloud_function/D002/text-match-event-job/**"
      context    = "cloud_function/D002/text-match-event-job"
      image_name = "${var.region}-docker.pkg.dev/${var.project_id}/links-veda/text-match-event-job:latest"
      enviroment = merge(local.db_info, local.cms_get_assets_token)
    }
  ]

  functions = local.functions_trigger_http
}

# Create Service Account for HTTP-triggered Cloud Functions
data "google_service_account" "function_sa_for_http_d001" {
  for_each = { for func in local.functions_trigger_http : func.name => func }

  account_id = each.value.sa
}

# Create Service Account for Cloud Run Jobs
data "google_service_account" "function_sa_for_job_d001" {
  for_each = { for func in local.cloud_run_job : func.name => func }

  account_id = each.value.sa
}

# Combine all service accounts into a single map
locals {
  all_service_accounts_d001 = merge(
    data.google_service_account.function_sa_for_http_d001,
    data.google_service_account.function_sa_for_job_d001
  )

  # List of roles to assign
  roles_d001 = ["roles/run.invoker"]

  # Create a mapping between service accounts and roles
  sa_roles_map_d001 = {
    for pair in setproduct(keys(local.all_service_accounts_d001), local.roles_d001) :
    "${pair[0]}-${pair[1]}" => {
      sa_email = local.all_service_accounts_d001[pair[0]].email
      role     = pair[1]
    }
  }
}

resource "google_cloud_run_v2_job" "dms-all-job" {
  for_each            = { for job in local.cloud_run_job : job.name => job }
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
          for_each = each.value.name == "structure-job" ? local.secret_environment_variables_llm_doc_structure : []
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
        dynamic "env" {
          for_each = each.value.name == "data-cleansing-job" ? [1] : []
          content {
            name = "AWS_LOCATION_SERVICE_API_KEY"
            value_source {
              secret_key_ref {
                secret  = "aws-location-service-api-key"
                version = "latest"
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
      service_account = data.google_service_account.function_sa_for_job_d001[each.key].email
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

locals {
  secret_environment_variables_llm_doc_structure = [
    {
      project_id = var.project_id,
      key        = "AWS_ACCESS_KEY_ID"
      secret     = "aws-access-key"
      version    = "latest"
    },
    {
      project_id = var.project_id,
      key        = "AWS_SECRET_ACCESS_KEY"
      secret     = "aws-secret-key"
      version    = "latest"
    }
  ]
}

data "archive_file" "source" {
  type = "zip"
  for_each = {
    for func in local.functions : func.name => {
      source_dir  = "${func.source}/${func.name}"
      output_path = "${func.source}/${func.file}"
    }
  }
  source_dir  = each.value.source_dir
  output_path = each.value.output_path
}

resource "google_storage_bucket_object" "objects" {
  for_each = {
    for func in local.functions : func.name => {
      name   = func.file
      bucket = google_storage_bucket.bucket.name
      source = data.archive_file.source[func.name].output_path
      hash   = replace(data.archive_file.source[func.name].output_base64sha256, "/", "$")
    }
  }
  name   = "${each.value.name}-${each.value.hash}.zip"
  bucket = each.value.bucket
  source = each.value.source
}

resource "google_cloudfunctions2_function" "function_d001" {
  for_each = {
    for func in local.functions_trigger_http : func.name => func
  }
  name        = each.value.name
  location    = var.region
  description = "a new function"

  build_config {
    runtime     = "python312"
    entry_point = each.value.entry
    source {
      storage_source {
        bucket = google_storage_bucket.bucket.name
        object = google_storage_bucket_object.objects[each.value.name].name
      }
    }
  }

  service_config {
    available_memory      = "512M"
    timeout_seconds       = 540
    service_account_email = data.google_service_account.function_sa_for_http_d001[each.key].email

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
    dynamic "secret_environment_variables" {
      for_each = each.value.name == "suggest-schema-structure" ? local.secret_environment_variables_llm_doc_structure : []
      content {
        project_id = var.project_id
        key        = secret_environment_variables.value.key
        secret     = secret_environment_variables.value.secret
        version    = secret_environment_variables.value.version
      }
    }

    dynamic "secret_environment_variables" {
      for_each = each.value.name == "data-cleansing" ? [1] : []
      content {
        project_id = var.project_id
        key        = "AWS_LOCATION_SERVICE_API_KEY"
        secret     = "aws-location-service-api-key"
        version    = "latest"
      }
    }
    environment_variables = lookup(each.value, "environment_variables", {})
  }
}
