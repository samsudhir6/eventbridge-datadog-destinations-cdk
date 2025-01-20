#!/usr/bin/env node
import { App, Tags } from 'aws-cdk-lib';
import { EventBusStack } from '../lib/eventbus-stack';
import * as env from 'env-var';
import * as cdk from 'aws-cdk-lib';
import 'source-map-support/register';
import { config } from '../config/api-destination-variables';


const app = new App();
const environment = String(app.node.tryGetContext("ENVIRONMENT"));


new EventBusStack(app, `DatadogApiDestinationsEventbus`, {
    destinationProps: config[environment],
});