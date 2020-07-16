# Deploy using SAM CLI

Install [AWS CLI](https://aws.amazon.com/cli) and [SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html).

You also need to add the file **deploy/client/.env** similar to [.env.example](client/.env.example) and set the **NEXT_PUBLIC_EDAV_S3_SIGN_URL** and **NEXT_PUBLIC_EDAV_SERVER_URL** variables to the URLs used for deployment. Unfortunately, unless you are using a custom domain name, these URLs will not be available until after the first deployment since Next.js does not support [runtime configuration](https://nextjs.org/docs/api-reference/next.config.js/runtime-configuration) for serverless builds as of the moment of writing this template.

After you configure your AWS account:

```sh
export S3_BUCKET=<S3 Bucket for SAM packaging>
# Override SAM arguments
export SAM_ARGS='--parameter-overrides ParameterKey=CloudfrontAliases,ParameterValue=example.com'
make deploy
```

You may also refer to [example.com.sh](example.com.sh) and [.env.example](client/.env.example) for customization and parameterization examples.
