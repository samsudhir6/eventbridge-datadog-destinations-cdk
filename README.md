# eventbridge-datadog-destinations-cdk

# Introduction 
This repo is for creating the infrastructure in aws for sending events to datadog via eventbridge api desitnations.

# Resources created 
1. Eventbus
2. API Connection
3. API Destination
4. DLQs
5. Eventbridge Rules
6. IAM Roles

# Pre-requisites

## Datadog API Key
Eventbridge requires a datadog APi Key to push events to datadog. The Key should be created in datadog and stored as a secret in AWS Secrets Manager. This ARN will have to be added to the `api-destination-variables.ts`.


# Build and Test
Run `npm install` to install dependencies.
Run `npm run test` to initiate unit test cases for CDK Constructs

# Synthesizing CDK Template
`cdk synth` synthesizes the CDK app into a cloudformation template. Running `cdk synth -c ENVIRONMENT=dev` will result in a cdk.out folder being created with a cloudformation template.

# Deploying CDK
`cdk deploy` deploys the CDK app to the AWS Account specified in `bin/index.ts`
`cdk deploy -c ENVIRONMENT=dev`

The `cdk.json` file tells the CDK Toolkit how to execute your app.

# Useful commands
* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk deploy`  deploy this stack to your default AWS account/region
* `cdk diff`    compare deployed stack with current state