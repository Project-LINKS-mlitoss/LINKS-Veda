locals {
  region = {
    REGION = "${var.region}"
  }
}

locals {
  project_id = {
    PROJECT_ID = var.project_id
  }
}

locals {
  swagger = <<CONFIG
    swagger: '2.0'
    info:
      title: ""
      description: "API Gateway for Cloud Function"
      version: "1.0.0"
    host: "dms.example.com"
    schemes:
      - "https"
    paths:
      /api/structure:
        post:
          summary: "Entry UnstructData"
          operationId: entryUnstructData
          consumes:
            - "application/json"
          produces:
            - "application/json"
          parameters:
            - in: "body"
              name: "body"
              required: true
              schema:
                type: object
                properties:
                  mode:
                    type: string
                  files:
                    type: array
                    items:
                      type: object
                      properties:
                        id:
                          type: string
                        url:
                          type: string
                  schema:
                    type: object
                    properties:
                      type:
                        type: string
                      properties:
                        type: object
                        additionalProperties:
                          type: object
                          properties:
                            type:
                              type: string
                            title:
                              type: string
                            description:
                              type: string
                  prompt:
                    type: string
                  apiEndpoint:
                    type: string
                example:
                  mode: "create"
                  files:
                    - id: "xxx"
                      url: "https://example.com/uuid/hoge/example1.pdf"
                    - id: "yyy"
                      url: "https://example.com/uuid/hoge/example2.pdf"
                    - id: "zzz"
                      url: "https://example.com/uuid/hoge/example3.pdf"
                  schema:
                    type: "object"
                    properties:
                      foo:
                        type: "string"
                        title: "Field Name"
                        description: "info for LLM"
                      bar:
                        type: "string"
                        title: "Field Name"
                        description: "info for LLM"
                      baz:
                        type: "boolean"
                        title: "Field Name"
                        description: "info for LLM"
                  prompt: "このPDFの詳細を抽出してください。"
                  apiEndpoint: "https://dms.example.com/api/xxxxx/xxxx?sig=xxxxxxxx"
          responses:
            200:
              description: OK
              schema:
                type: object
                properties:
                  status:
                    type: string
                  ticketId:
                    type: string
                  message:
                    type: string  
                  responseType:
                    type: string
                  schema:
                    type: object
                    properties:
                      type:
                        type: string
                      properties:
                        type: object
                        additionalProperties:
                          type: object
                          properties:
                            name:
                              type: string
                            type:
                              type: string
                example:
                  status: "ok"    
                  ticketId: "hogehoge"
                  message: "processing"
                  responseType: "json"
                  schema:
                    type: "object"
                    properties:
                      name:
                        name: "名前"
                        type: "string"
          x-google-backend:
            address: "https://${var.region}-${var.project_id}.cloudfunctions.net/entry-unstruct-data"
            deadline: 600.0
      /api/preprocess:
        post:
          summary: "Entry structData"
          operationId: entryStructData
          consumes:
            - "application/json"
          produces:
            - "application/json"
          parameters:
            - in: "body"
              name: "body"
              required: true
              schema:
                type: object
                properties:
                  input:
                    type: string
                  cleansing:
                    type: object
                    properties:
                      op:
                        type: array
                        items:
                          type: object
                          properties:
                            type:
                              type: string
                              enum:
                                - zenkaku
                                - hankaku
                                - replace
                                - year
                                - number
                            fields:
                              type: array
                              items:
                                type: string
                            target:
                              type: string
                            replace:
                              type: string
                  normalizeCrs:
                    type: boolean
                  geocoding:
                    type: object
                    properties:
                      fields:
                        type: array
                        items:
                          type: string
                  apiEndpoint:
                    type: string
                example:
                  input: "<https://xxxx/example1.json>"
                  cleansing:
                    op:
                      - type: "zenkaku"
                        fields: ["住所"]
                        target: "鳥取市"
                        replace: "鳥取町"
                  normalizeCrs: true
                  geocoding:
                    fields: ["住所1",  "住所2"]
                  apiEndpoint: "https://dms.example.com/api/xxxxx/xxxx?sig=xxxxxxxx"
          responses:
            200:
              description: OK
              schema:
                type: object
                properties:
                  status:
                    type: string
                  ticketId:
                    type: string
                  message:
                    type: string  
                  responseType:
                    type: string
                  schema:
                    type: object
                    properties:
                      type:
                        type: string
                      properties:
                        type: object
                        additionalProperties:
                          type: object
                          properties:
                            name:
                              type: string
                            type:
                              type: string
                example:
                  status: "ok"    
                  ticketId: "hogehoge"
                  message: "processing"
                  responseType: "json"
                  schema:
                    type: "object"
                    properties:
                      name:
                        name: "名前"
                        type: "string"
          x-google-backend:
            address: "https://${var.region}-${var.project_id}.cloudfunctions.net/entry-struct-data"
            deadline: 600.0
      /api/tickets/{ticketId}:
        get:
          summary: "Retrieve ticket status"
          operationId: getTicketStatus
          parameters:
            - name: ticketId
              in: path
              required: true
              description: "ID of the ticket to retrieve"
              type: string
          responses:
            '200':
              description: "Successful response"
              schema:
                type: object
                properties:
                  status:
                    type: string
                    enum:
                      - "queue"
                      - "processing"
                      - "completed"
                    description: "Status of the ticket"
                  message:
                    type: string
                    description: "Status message"
                  files:
                    type: array
                    items:
                      type: object
                      properties:
                        fileId:
                          type: string
                          description: "ID of the file"
                        status:
                          type: string
                          enum:
                            - "queue"
                            - "processing"
                            - "calling-back"
                            - "success"
                            - "error"
                          description: "Processing status of the file"
                        message:
                          type: string
                          description: "Error message if any"      
          x-google-backend:
            address: "https://${var.region}-${var.project_id}.cloudfunctions.net/polling-status"
            deadline: 600.0
      /api/text_match:
        post:
          summary: "Text Match"
          operationId: textmatch
          consumes:
            - "application/json"
          produces:
            - "application/json"
          parameters:
            - in: "body"
              name: "body"
              required: true
              schema:
                type: object
                properties:
                  inputLeft:
                    type: string
                  inputRight:
                    type: string  
                  where:
                    type: array
                    items:
                      type: object
                      properties:
                        leftField:
                          type: string
                        rightField:
                          type: string
                  threshold:
                    type: number
                    description: Threshold value between 0 and 1
                  apiEndpoint:
                    type: string
                    description: API endpoint to call
                example:
                  inputLeft: "https://example.com/uuid/hoge/example1.json"
                  inputRight: "https://example.com/uuid/hoge/example2.json"
                  where:
                    - leftField: "field1"
                      rightField: "field2"
                  threshold: 0.1
                  apiEndpoint: "https://dms.example.com/api/xxxxx/xxxx?sig=xxxxxxxx"    
          responses:
            200:
              description: OK
              schema:
                type: object
                properties:
                  status:
                    type: string
                  ticketId:
                    type: string
                  message:
                    type: string
                example:
                  status: "ok"
                  ticketId: "1234"  
                  message: "text_matching"
          x-google-backend:
            address: "https://${var.region}-${var.project_id}.cloudfunctions.net/text-match"
            deadline: 600.0
      /api/spatial_join:
        post:
          summary: "Spatial Join"
          operationId: spatialjoin
          consumes:
            - "application/json"
          produces:
            - "application/json"
          parameters:
            - in: "body"
              name: "body"
              required: true
              schema:
                type: object
                properties:
                  inputLeft:
                    type: string
                  inputRight:
                    type: string  
                  op:
                    type: string
                    enum:
                      - "intersects"
                      - "nearest"
                  distance:
                    type: number
                  apiEndpoint:
                    type: string
                    description: API endpoint to call
                example:
                  inputLeft: "https://example.com/uuid/hoge/example1.geojson"
                  inputRight: "https://example.com/uuid/hoge/example2.geojson"
                  op: "intersects"
                  distance: 500
                  apiEndpoint: "https://dms.example.com/api/xxxxx/xxxx?sig=xxxxxxxx"    
          responses:
            200:
              description: OK
              schema:
                type: object
                properties:
                  status:
                    type: string
                  ticketId:
                    type: string
                  message:
                    type: string
                example:
                  status: "ok"
                  ticketId: "1234"  
                  message: "spatial_join"
          x-google-backend:
            address: "https://${var.region}-${var.project_id}.cloudfunctions.net/spatial-join"
            deadline: 600.0
      /api/spatial_aggregate:
        post:
          summary: "Spatial Aggregate"
          operationId: spatialaggregate
          consumes:
            - "application/json"
          produces:
            - "application/json"
          parameters:
            - in: "body"
              name: "body"
              required: true
              schema:
                type: object
                properties:
                  inputLeft:
                    type: string
                  inputRight:
                    type: string  
                  fields:
                    type: array
                    items:
                      type: object
                      properties:
                        name:
                          type: string
                        sum:
                          type: boolean
                        avg:
                          type: boolean
                        cnt:
                          type: boolean  
                  apiEndpoint:
                    type: string
                    description: API endpoint to call
                example:
                  inputLeft: "https://example.com/uuid/hoge/example1.geojson"
                  inputRight: "https://example.com/uuid/hoge/example2.geojson"
                  fields:
                    - name: "population"
                      sum: true
                      avg: true
                      cnt: true
                    - name: "income"
                      sum: true
                      avg: true
                      cnt: true  
                  apiEndpoint: "https://dms.example.com/api/xxxxx/xxxx?sig=xxxxxxxx"    
          responses:
            200:
              description: OK
              schema:
                type: object
                properties:
                  status:
                    type: string
                  ticketId:
                    type: string
                  message:
                    type: string
                example:
                  status: "ok"
                  ticketId: "1234"  
                  message: "spatial_aggregate"
          x-google-backend:
            address: "https://${var.region}-${var.project_id}.cloudfunctions.net/spatial-aggregate"
            deadline: 600.0
      /api/cross:
        post:
          summary: "Cross"
          operationId: cross
          consumes:
            - "application/json"
          produces:
            - "application/json"
          parameters:
            - in: "body"
              name: "body"
              required: true
              schema:
                type: object
                properties:
                  input:
                    type: string
                  keyFields:
                    type: array  
                    items:
                      type: string
                  fields:
                    type: array
                    items:
                      type: object
                      properties:
                        name:
                          type: string
                        sum:
                          type: boolean
                        avg:
                          type: boolean
                        cnt:
                          type: boolean  
                  apiEndpoint:
                    type: string
                    description: API endpoint to call
                example:
                  input: "https://example.com/uuid/hoge/example1.json"
                  keyFields: ["住所1",  "住所2"]
                  fields:
                    - name: "住所1"
                      sum: no
                      avg: no
                      cnt: true
                    - name: "住所2"
                      sum: no
                      avg: no
                      cnt: true  
                  apiEndpoint: "https://dms.example.com/api/xxxxx/xxxx?sig=xxxxxxxx"
          responses:
            200:
              description: OK
              schema:
                type: object
                properties:
                  status:
                    type: string
                  ticketId:
                    type: string
                  message:
                    type: string
                example:
                  status: "ok"
                  ticketId: "1234"  
                  message: "cross"
          x-google-backend:
            address: "https://${var.region}-${var.project_id}.cloudfunctions.net/cross"
            deadline: 600.0
      /api/vectorize:
        post:
          summary: "Vector Store"
          operationId: vector_store
          consumes:
            - "application/json"
          produces:
            - "application/json"
          parameters:
            - in: "body"
              name: "body"
              required: true
              schema:
                type: object
                properties:
                  id:
                    type: string  
                  input:
                    type: string
                example:
                  id: "VT001"
                  apiEndpoint: "https://dms.example.com/api/xxxxx/xxxx?sig=xxxxxxxx"
          responses:
            200:
              description: OK
              schema:
                type: object
                properties:
                  status:
                    type: string
                  ticketId:
                    type: string
                  message:
                    type: string
                example:
                  status: "ok"
                  ticketId: "1234"  
                  message: "処理が完了しました"
          x-google-backend:
            address: "https://${var.region}-${var.project_id}.cloudfunctions.net/vectorize"
            deadline: 600.0
      /api/chat:
        post:
          summary: "ChatBot"
          operationId: chatbot
          consumes:
            - "application/json"
          produces:
            - "application/json"
          parameters:
            - in: "body"
              name: "body"
              required: true
              schema:
                type: object
                properties:
                  targetId:
                    type: string
                  prompt:
                    type: string
                  category:
                    type: string
                example:
                  targetId: "VT001"
                  prompt: "以下の場所で事故が発生したかどうかを知りたいです: 沖縄県石垣市川平湾入口"
                  category: "UC"
          responses:
            200:
              description: OK
              schema:
                type: object
                properties:
                  status:
                    type: string
                  answer:
                    type: string
          x-google-backend:
            address: "https://${var.region}-${var.project_id}.cloudfunctions.net/chatbot" 
            deadline: 600.0
      /api/column-japanese-to-english:
        post:
          summary: "translate"
          operationId: column_translate
          consumes:
            - "application/json"
          produces:
            - "application/json"
          parameters:
            - in: "body"
              name: "body"
              required: true
              schema:
                type: object
                properties:
                  columns:
                    type: string
                example:
                  columns: [{ "jp_name": "必須", "description": "データの説明には値が必須ですか？" },  { "jp_name": "内容", "description": "" }, { "jp_name": "住所", "description": ""}]

          responses:
            200:
              description: OK
              schema:
                type: object
                properties:
                  columns:
                    type: array
          x-google-backend:
            address: "https://${var.region}-${var.project_id}.cloudfunctions.net/columns-translate"
            deadline: 600.0
      /api/masking-data:
        post:
          summary: "Masking Data"
          operationId: masking_data
          consumes:
            - "application/json"
          produces:
            - "application/json"
          parameters:
            - in: "body"
              name: "body"
              required: true
              schema:
                type: object
                properties:
                  input:
                    type: string
                  option:
                    type: array
                    items:
                      type: object
                      properties:
                        type:
                          type: string
                        field:
                          type: string
                        max_rank:
                          type: number
                        prefix:
                          type: string
                  apiEndpoint:
                    type: string
                    description: API endpoint to call
                example:
                  input: "https://example.com/uuid/hoge/example1.json"
                  option:
                    - type: "ranking"
                      field: "salary"
                      max_rank: 10
                    - type: "deviation_val"
                      field: "score"
                    - type: "masking_id"
                      field: "id"
                      prefix: "FMD"
                    - type: "masking_address"
                      field: "address"
                  apiEndpoint: "https://dms.example.com/api/xxxxx/xxxx?sig=xxxxxxxx"
          responses:
            200:
              description: OK
              schema:
                type: object
                properties:
                  status:
                    type: string
                  ticketId:
                    type: string
                  message:
                    type: string
                example:
                  status: "ok"
                  ticketId: "1234"  
                  message: "masking_data"
          x-google-backend:
            address: "https://${var.region}-${var.project_id}.cloudfunctions.net/masking-data"
            deadline: 600.0
      /api/rdf-create:
        post:
          summary: "Creat Rdf"
          operationId: create_rdf
          consumes:
            - "application/json"
          produces:
            - "application/json"
          parameters:
            - in: "body"
              name: "body"
              required: true
              schema:
                type: object
                properties:
                  input:
                    type: string
                  apiEndpoint:
                    type: string
                    description: API endpoint to call
                example:
                  input: "https://example.com/uuid/hoge/example1.xlsx"
                  apiEndpoint: "https://dms.example.com/api/xxxxx/xxxx?sig=xxxxxxxx"
          responses:
            200:
              description: OK
              schema:
                type: object
                properties:
                  status:
                    type: string
                  ticketId:
                    type: string
                  message:
                    type: string
                example:
                  status: "ok"
                  ticketId: "1234"
                  message: "creat_rdf"
          x-google-backend:
            address: "https://${var.region}-${var.project_id}.cloudfunctions.net/create-rdf"
            deadline: 600.0
      /api/suggest-schema-structure:
        post:
          summary: "Suggest Schema Structure"
          operationId: suggestSchemaStructure
          consumes:
            - "application/json"
          produces:
            - "application/json"
          parameters:
            - in: "body"
              name: "body"
              required: true
              schema:
                type: object
                properties:
                  input:
                    type: string
                example:
                  input: "https://example.com/uuid/hoge/example1.pdf"
          responses:
            200:
              description: OK
              schema:
                type: object
                properties:
                  status:
                    type: string
                  message:
                    type: string
                  data:
                    type: object
                    properties:
                      $schema:
                        type: string
                      type:
                        type: string
                      properties:
                        type: object
                        additionalProperties:
                          type: object
                          properties:
                            type:
                              type: string
                            description:
                              type: string
                example:
                  status: "ok"
                  message: "Success"
                  data:
                    type: "object"
                    properties:
                      事故等番号:
                        description: "事故の識別番号"
                        type: "string"
          x-google-backend:
            address: "https://${var.region}-${var.project_id}.cloudfunctions.net/suggest-schema-structure"
            deadline: 600.0
  CONFIG
}

resource "google_storage_bucket" "bucket" {
  name          = var.bucket_name
  location      = var.region
  force_destroy = true
}

resource "google_api_gateway_api" "api" {
  provider     = google-beta
  api_id       = "linksdms-api"
  display_name = "LinksDms API"
}

resource "google_api_gateway_gateway" "gateway" {
  provider     = google-beta
  api_config   = google_api_gateway_api_config.config.id
  gateway_id   = "linksdms-gateway"
  display_name = "LinksDms Gateway"
  region       = var.region
}

resource "google_api_gateway_api_config" "config" {
  provider      = google-beta
  api           = google_api_gateway_api.api.api_id
  api_config_id = "my-config-${md5(local.swagger)}"

  openapi_documents {
    document {
      path     = "openapi.yaml"
      contents = base64encode(local.swagger)
    }
  }
  lifecycle {
    create_before_destroy = true
  }
}

output "gateway_info" {
  value = google_api_gateway_gateway.gateway
}
