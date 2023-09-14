import {IncomingWebhook, IncomingWebhookSendArguments} from '@slack/webhook';
import {TransformableInfo} from 'logform';
import {LEVEL, MESSAGE, SPLAT} from 'triple-beam';
import {LogCallback} from 'winston';
import * as Transport from 'winston-transport';

export interface SlackTransportOptions
    extends Transport.TransportStreamOptions, IncomingWebhookSendArguments {
    webhook_url: string;
}

export class SlackLogger extends Transport {
    private readonly config: SlackTransportOptions;
    private readonly webhook: IncomingWebhook;

    constructor(config: SlackTransportOptions) {
        super(config);

        if (!config) {
            throw new Error('A configuration must be provided');
        }

        if (!config.webhook_url) {
            throw new Error('Configuration must include webhook_url');
        }

        this.config = config;
        this.handleExceptions = !!config.handleExceptions;
        this.webhook = new IncomingWebhook(config.webhook_url, config);
    }

    public log(info: TransformableInfo, callback: LogCallback) {
        const formattedInfo: TransformableInfo = this.config.format
            ? this.config.format.transform(info) as TransformableInfo
            : info;

        delete formattedInfo[MESSAGE];
        delete formattedInfo[SPLAT];
        delete formattedInfo[LEVEL];

        const texts: string[] = [];

        for (const key of Object.keys(formattedInfo).sort()) {
            const formattedKey = key.charAt(0).toUpperCase() + key.slice(1);
            const value = formattedInfo[key];
            texts.push(`*${formattedKey}*\n` + value?.toString());
        }

        this.webhook.send({
            ...this.config,
            text: texts.join('\n'),
        })
            .then(() => {
                callback?.(null);
            })
            .catch((e: any) => {
                callback?.(e);
            });
    }
}
