import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as events from 'aws-cdk-lib/aws-events';
import { DatadogRule } from './datadog-rule';
import { IEventBusProps } from './eventbus-base-stack';
import * as sqs from 'aws-cdk-lib/aws-sqs';


export class EventBusStack extends cdk.Stack {

    constructor(scope: Construct, id: string, props: IEventBusProps) {
        super(scope, id);

        //create eventbus
        const apiDestinationEventBus = new events.EventBus(this, 'ApiDestinationEventBus', {
            eventBusName: 'api-destinations-event-bus'
        });

        //create dead letter queue
        const apiDestinationdeadLetterQueue = new sqs.Queue(this, 'ApiDestinationEventDlq', {
            queueName: 'api-destinations-dead-letter-queue'
        });

        //eventbridge rule for sending events to datadog
        const datadogRule = new DatadogRule(this, 'DatadogRule', {
            eventbus: apiDestinationEventBus,
            deadLetterQueueArn: apiDestinationdeadLetterQueue,
            destinationProps: props.destinationProps
        });
    }
}
