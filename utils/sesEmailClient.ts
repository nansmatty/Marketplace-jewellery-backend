require('dotenv').config({ path: '../.env' });
import { SESClient, SESClientConfig } from '@aws-sdk/client-ses';
import { aws_config_params } from '../config/aws-config';

export const sesClientConfig: SESClientConfig = aws_config_params;

export const sesClient = new SESClient(sesClientConfig);
