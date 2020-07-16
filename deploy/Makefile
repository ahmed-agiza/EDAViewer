include ../config.mk
S3_BUCKET := $(S3_BUCKET)
STACK_NAME ?= EDAV

TEMPLATE = template.yaml
LOCAL_PORT ?= 8080


DEBUG ?=
ifneq ($(DEBUG),"")
 DEBUG=""
endif

SAM_ARGS ?=


.PHONY: clean
clean:
	@rm -f server/edav-server

.PHONY: install
install:
	@cd server && go get ./... && cd -

.PHONY: update
update:
	@cd server && go get -u ./... && cd -


# NOTE: for static linking to work you need to have static versions from Tcl & Zlib..
# TODO: build inside docker
.PHONY: server
server: ./server/main.go
	@cd .. && make opendb && cd - && cd server && GOOS=linux GOARCH=amd64 CGO_LDFLAGS=$(CGO_LDFLAGS) go build --ldflags '-extldflags "-lm -lz -ldl -lstdc++ -static"' -o edav-server

lambda:server
	@sam build $(SAM_ARGS)

.PHONY: build
build: clean lambda

.PHONY: run
run: build
	@sam local start-api --port $(LOCAL_PORT) $(DEBUG)

.PHONY: package
package: build
	@sam package --template-file $(TEMPLATE) --s3-bucket $(S3_BUCKET)

.PHONY: deploy
deploy: package
	@sam deploy --stack-name $(STACK_NAME) --s3-bucket $(S3_BUCKET) --capabilities CAPABILITY_IAM $(SAM_ARGS) && \
	CLOUDFRONT_BUCKET=$$(aws cloudformation describe-stacks --stack-name $(STACK_NAME) --query "Stacks[0].Outputs[?OutputKey==\`ClientStaticBucket\`].OutputValue" --output text) && \
	echo "Syncing static client files to s3://$$CLOUDFRONT_BUCKET" && \
	aws s3 sync .aws-sam/build/ClientIndex/.next/static s3://$$CLOUDFRONT_BUCKET/_next/static && \
	APP_URL=$$(aws cloudformation describe-stacks --stack-name $(STACK_NAME) --query "Stacks[0].Outputs[?OutputKey==\`ApplicationURL\`].OutputValue" --output text) && \
	echo "Access at $$APP_URL"

.PHONY: destroy
destroy:
	CLOUDFRONT_BUCKET=$$(aws cloudformation describe-stacks --stack-name $(STACK_NAME) --query "Stacks[0].Outputs[?OutputKey==\`ClientStaticBucket\`].OutputValue" --output text); \
	aws s3 rm s3://$$CLOUDFRONT_BUCKET --recursive; \
	DESIGN_UPLOAD_BUCKET=$$(aws cloudformation describe-stacks --stack-name $(STACK_NAME) --query "Stacks[0].Outputs[?OutputKey==\`DesignUploadBucket\`].OutputValue" --output text); \
	aws s3 rm s3://$$DESIGN_UPLOAD_BUCKET --recursive; \
	aws s3 rm s3://$$S3_BUCKET --recursive; \
	aws cloudformation delete-stack --stack-name $(STACK_NAME)