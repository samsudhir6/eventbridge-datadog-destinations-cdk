import { StackProps } from 'aws-cdk-lib'
import * as events from 'aws-cdk-lib/aws-events';
import * as sqs from 'aws-cdk-lib/aws-sqs';

export interface IDatadogRuleProps {
  eventbus: events.EventBus;
  deadLetterQueueArn: sqs.Queue;
  destinationProps: IDestinationProps;
};

export interface IConfig {
  [env: string]: IDestinationProps;
}

export interface IDestinationProps {
  datadogApiKeySecretARN: string;
}

export interface IEventBusProps extends StackProps {
  destinationProps: IDestinationProps;
}