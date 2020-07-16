#!/bin/bash
set -e
# Note you need to have your domain to be managed through Route53 for the custom domain configuration to work
export S3_BUCKET=<S3 SAM Bucket>
export CLOUDFRONT_CERT_ARN="arn:aws:acm:us-east-1:<AccountID>:certificate/<CertificateID>"
export GATEWAY_CERT_ARN="arn:aws:acm:<Region>:<AccountID>:certificate/<CertificateID>"
export CLOUDFRONT_ALIAS="example.com"
export CLIENT_SECONDARY_SUBDOMAIN="www"
export SERVER_SUBDOMAIN="api"
export SIGN_SUBDOMAIN="sign"
export DOMAIN_NAME="example.com"
export CORS_ORIGIN="'*'"
export SAM_ARGS="--parameter-overrides ParameterKey=GatewayCertificateArn,ParameterValue=$GATEWAY_CERT_ARN ParameterKey=CloudfrontCertificateArn,ParameterValue=$CLOUDFRONT_CERT_ARN ParameterKey=CloudfrontAliases,ParameterValue=$CLOUDFRONT_ALIAS ParameterKey=DomainName,ParameterValue=$DOMAIN_NAME ParameterKey=ClientSecondarySubDomain,ParameterValue=$CLIENT_SECONDARY_SUBDOMAIN ParameterKey=CorsAllowedOrigin,ParameterValue=$CORS_ORIGIN ParameterKey=ServerSubDomain,ParameterValue=$SERVER_SUBDOMAIN ParameterKey=SignSubDomain,ParameterValue=$SIGN_SUBDOMAIN"
make deploy

