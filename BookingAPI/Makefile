LOCAL_DIR=local
DOCKER_COMPOSE_FILE=$(LOCAL_DIR)/compose.yaml
OPENAPI_FILE=/tmp/api.yaml
BUCKET=s3://omg-properties-knowladge

AGW_ID=$(shell sam list stack-outputs --output json | jq '.[] | select(.OutputKey | contains("ApiGatewayId")) | .OutputValue')

.PHONY: build
build:
	sam build --no-cached

.PHONY: local
local: build
	docker compose -f $(DOCKER_COMPOSE_FILE) up -d
	sam local start-api --env-vars $(LOCAL_DIR)/env.json
	docker compose -f $(DOCKER_COMPOSE_FILE) down

.PHONY: deploy
deploy: build
	@sam deploy --no-fail-on-empty-changeset --no-confirm-changeset
	@$(MAKE) _clean_openapi
	@$(MAKE) _upload_openapi

.PHONY: _get_agw_id
_get_agw_id:
	@echo $(AGW_ID)

.PHONY: _export_opeanapi
_export_openapi:
	@aws apigateway get-export --no-cli-pager --rest-api-id $(AGW_ID) --stage-name dev --export-type oas30 --accepts application/yaml $(OPENAPI_FILE)

.PHONY: _clean_openapi
_clean_openapi:
	@yq '(.. | select(tag == "!!map")) |= with_entries(select(.key | test("^x-") | not))' api.yaml > $(OPENAPI_FILE)

.PHONY: _upload_openapi
_upload_openapi:
	@aws s3 cp $(OPENAPI_FILE) $(BUCKET)
