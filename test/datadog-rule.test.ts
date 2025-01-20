import { Template, Match } from 'aws-cdk-lib/assertions';
import * as cdk from 'aws-cdk-lib';
import { DatadogRule } from '../lib/datadog-rule';
import * as events from 'aws-cdk-lib/aws-events';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import { config } from '../config/api-destination-variables';

test('Create Datadog API Destination', () => {
    const stack = new cdk.Stack();

    // WHEN
    new DatadogRule(stack, 'DatadogRuleTest', {
        eventbus: new events.EventBus(stack, 'ApiDestinationEventBus', {
            eventBusName: 'api-destinations-event-bus'
        }),
        deadLetterQueueArn: new sqs.Queue(stack, 'ApiDestinationEventDlq', {
            queueName: 'api-destinations-dead-letter-queue'
        }),
        destinationProps: config['dev']
    });

    // THEN
    const template = Template.fromStack(stack);
    template.resourceCountIs("AWS::Events::ApiDestination", 1);
    template.hasResourceProperties('AWS::Events::ApiDestination', {
        "ConnectionArn": {
            "Fn::GetAtt": [
                Match.anyValue(),
                "Arn"
            ]
        },
        "HttpMethod": "POST",
        "InvocationEndpoint": "https://api.datadoghq.com/api/v1/events",
        "InvocationRateLimitPerSecond": 300,
        "Name": "DataDogApiDestination"
    });
});

test('Create Datadog API Connection', () => {
    const stack = new cdk.Stack();

    // WHEN
    new DatadogRule(stack, 'DatadogRuleTest', {
        eventbus: new events.EventBus(stack, 'ApiDestinationEventBus', {
            eventBusName: 'api-destinations-event-bus'
        }),
        deadLetterQueueArn: new sqs.Queue(stack, 'ApiDestinationEventDlq', {
            queueName: 'api-destinations-dead-letter-queue'
        }),
        destinationProps: config['dev']
    });

    // THEN
    const template = Template.fromStack(stack);
    template.resourceCountIs("AWS::Events::Connection", 1);
    template.hasResourceProperties('AWS::Events::Connection', {
        "AuthorizationType": "API_KEY",
        "AuthParameters": {
            "ApiKeyAuthParameters": {
                "ApiKeyName": "DD-API-KEY",
                "ApiKeyValue": Match.anyValue()
            },
            "InvocationHttpParameters": {
                "HeaderParameters": [
                    {
                        "Key": "Content-Type",
                        "Value": "application/json"
                    }
                ]
            }
        },
        "Description": "Connection with DD-API-KEY",
        "Name": "DataDogConnection"
    });
});

test('Create Datadog Rule', () => {
    const stack = new cdk.Stack();

    // WHEN
    new DatadogRule(stack, 'DatadogRuleTest', {
        eventbus: new events.EventBus(stack, 'ApiDestinationEventBus', {
            eventBusName: 'api-destinations-event-bus'
        }),
        deadLetterQueueArn: new sqs.Queue(stack, 'ApiDestinationEventDlq', {
            queueName: 'api-destinations-dead-letter-queue'
        }),
        destinationProps: config['dev']
    });

    // THEN
    const template = Template.fromStack(stack);
    template.resourceCountIs("AWS::Events::Rule", 1);
    template.hasResourceProperties('AWS::Events::Rule', {
        "EventBusName": {
            "Ref": Match.stringLikeRegexp('^ApiDestinationEventBus.*$')
        },
        "EventPattern": {
            "source": [
                "cli.putevents"
            ],
            "detail-type": [
                "datadog event"
            ]
        },
        "Name": "send-event-to-datadog",
        "Targets": [
            {
                "Arn": {
                    "Fn::GetAtt": [
                        Match.stringLikeRegexp('^DatadogRuleTestDataDogApiDestination.*$'),
                        "Arn"
                    ]
                },
                "DeadLetterConfig": {
                    "Arn": {
                        "Fn::GetAtt": [
                            Match.stringLikeRegexp('^ApiDestinationEventDlq.*$'),
                            "Arn"
                        ]
                    }
                },
                "Id": "datadogTargetProperty",
                "InputPath": "$.detail",
                "RoleArn": {
                    "Fn::GetAtt": [
                        Match.stringLikeRegexp('^DatadogRuleTestDatadogDestinationRole.*$'),
                        "Arn"
                    ]
                }
            }
        ]
    });
});

test('Create API Destination Role', () => {
    const stack = new cdk.Stack();

    // WHEN
    new DatadogRule(stack, 'DatadogRuleTest', {
        eventbus: new events.EventBus(stack, 'ApiDestinationEventBus', {
            eventBusName: 'api-destinations-event-bus'
        }),
        deadLetterQueueArn: new sqs.Queue(stack, 'ApiDestinationEventDlq', {
            queueName: 'api-destinations-dead-letter-queue'
        }),
        destinationProps: config['dev']
    });

    // THEN
    const template = Template.fromStack(stack);
    template.resourceCountIs("AWS::IAM::Role", 1);
    template.hasResourceProperties('AWS::IAM::Role', {
        "AssumeRolePolicyDocument": {
            "Statement": [
                {
                    "Action": "sts:AssumeRole",
                    "Effect": "Allow",
                    "Principal": {
                        "Service": "events.amazonaws.com"
                    }
                }
            ],
            "Version": "2012-10-17"
        }
    });
});

test('Create API Destination Role Policy', () => {
    const stack = new cdk.Stack();

    // WHEN
    new DatadogRule(stack, 'DatadogRuleTest', {
        eventbus: new events.EventBus(stack, 'ApiDestinationEventBus', {
            eventBusName: 'api-destinations-event-bus'
        }),
        deadLetterQueueArn: new sqs.Queue(stack, 'ApiDestinationEventDlq', {
            queueName: 'api-destinations-dead-letter-queue'
        }),
        destinationProps: config['dev']
    });

    // THEN
    const template = Template.fromStack(stack);
    template.resourceCountIs("AWS::IAM::Policy", 1);
    template.hasResourceProperties('AWS::IAM::Policy', {
        "PolicyDocument": {
            "Statement": [
                {
                    "Action": "events:InvokeApiDestination",
                    "Effect": "Allow",
                    "Resource": {
                        "Fn::GetAtt": [
                            Match.stringLikeRegexp('^DatadogRuleTestDataDogApiDestination.*$'),
                            "Arn"
                        ]
                    }
                }
            ],
            "Version": "2012-10-17"
        },
        "PolicyName": Match.stringLikeRegexp('^DatadogRuleTestDatadogDestinationRoleDefaultPolicy.*$'),
        "Roles": [
            {
                "Ref": Match.stringLikeRegexp('^DatadogRuleTestDatadogDestinationRole.*$')
            }
        ]
    });
});