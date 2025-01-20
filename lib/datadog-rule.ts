import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as events from 'aws-cdk-lib/aws-events';
import { HttpMethod, HttpParameter } from 'aws-cdk-lib/aws-events';
import { IDatadogRuleProps } from './eventbus-base-stack'



export class DatadogRule extends Construct {

    private props: IDatadogRuleProps

    constructor(scope: Construct, id: string, props: IDatadogRuleProps) {
        super(scope, id);
        this.props = props;

        //Create a connection to the destination API
        const datadogConnection = new events.Connection(this, 'DataDogConnection', {
            connectionName: 'DataDogConnection',
            authorization: events.Authorization.apiKey('DD-API-KEY', cdk.SecretValue.secretsManager(props.destinationProps.datadogApiKeySecretARN)),
            description: 'Connection with DD-API-KEY',
            headerParameters: {
                ['Content-Type']: HttpParameter.fromString("application/json")
            }
        });

        //Create an eventbridge API Destination
        const datadogApiDestination = new events.ApiDestination(this, 'DataDogApiDestination', {
            apiDestinationName: 'DataDogApiDestination',
            connection: datadogConnection,
            endpoint: 'https://api.datadoghq.com/api/v1/events',
            httpMethod: HttpMethod.POST,
            rateLimitPerSecond: 300,
        });

        // Create IAM role with permissions to invoke the APi destination
        const datadogDestinationRole = new iam.Role(this, `DatadogDestinationRole`, {
            assumedBy: new iam.ServicePrincipal('events.amazonaws.com'),
        });


        datadogDestinationRole.addToPolicy(new iam.PolicyStatement({
            resources: [datadogApiDestination.apiDestinationArn],
            actions: ["events:InvokeApiDestination"]
        }))


        //Dead letter queue config
        const deadLetterConfig: events.CfnRule.DeadLetterConfigProperty = {
            arn: props.deadLetterQueueArn.queueArn,
        };

        //Eventbridge rule target configuration
        const datadogTargetProperty: events.CfnRule.TargetProperty = {
            arn: datadogApiDestination.apiDestinationArn,
            id: 'datadogTargetProperty',
            inputPath: '$.detail',
            roleArn: datadogDestinationRole.roleArn,
            deadLetterConfig: deadLetterConfig
        };

        //Eventbridge rule for datadog events
        const datadogRule = new events.CfnRule(this, 'datadogRule', {
            eventPattern: {
                "source": ["cli.putevents"],
                "detail-type": ["datadog event"]
            },
            eventBusName: props.eventbus.eventBusName,
            name: 'send-event-to-datadog',
            targets: [datadogTargetProperty]
        });

    }


}
