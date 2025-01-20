import { Template, Match } from 'aws-cdk-lib/assertions';
import * as cdk from 'aws-cdk-lib';
import { EventBusStack } from '../lib/eventbus-stack';
import { config } from '../config/api-destination-variables';

test('Create API Destination Eventbus DLQ', () => {
    const stack = new cdk.Stack();

    // WHEN
    const eventbusTestStack = new EventBusStack(stack, 'EventBusStackTest', {
        destinationProps: config['dev']
    });

    // THEN
    const template = Template.fromStack(eventbusTestStack);
    template.resourceCountIs("AWS::Events::EventBus", 1);
    template.hasResourceProperties('AWS::Events::EventBus', {
        "Name": "api-destinations-event-bus"
    });
});

test('Create API Destination Eventbus', () => {
    const stack = new cdk.Stack();

    // WHEN
    const eventbusTestStack = new EventBusStack(stack, 'EventBusStackTest', {
        destinationProps: config['dev']
    });

    // THEN
    const template = Template.fromStack(eventbusTestStack);
    template.resourceCountIs("AWS::SQS::Queue", 1);
    template.hasResourceProperties('AWS::SQS::Queue', {
        "QueueName": "api-destinations-dead-letter-queue",
    });
});