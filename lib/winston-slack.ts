import Axios from 'axios';
import { TransformableInfo } from 'logform';
import { MESSAGE } from 'triple-beam';
import { LogCallback } from 'winston';
import * as Transport from 'winston-transport';

export interface SlackAttachment {
  fallback: string;
  color: string;
  pretext: string;
  author_name: string;
  author_link: string;
  author_icon: string;
  title: string;
  title_link: string;
  text: string;
  fields: [
    {
      title: string;
      value: string;
      short: boolean;
    },
  ];
  image_url: string;
  thumb_url: string;
  footer: string;
  footer_icon: string;
  ts: number;
}

export interface SlackPayload {
  attachments?: SlackAttachment[];
  channel?: string;
  username?: string;
  icon_url?: string;
  icon_emoji?: string;
  link_names?: boolean;
  unfurl_links?: boolean;
  unfurl_media?: boolean;
  text?: string;
}

export interface SlackTransportOptions
    extends Transport.TransportStreamOptions {
  webhook_url: string;
  channel?: string;
  username?: string;
  icon_url?: string;
  icon_emoji?: string;
  attachments?: SlackAttachment[];
  unfurl_links?: boolean;
  unfurl_media?: boolean;
  link_names?: boolean;
}

export class SlackLogger extends Transport {
  private config: SlackTransportOptions;
  private axios = Axios.create({
      headers: {
          'Content-Type': 'application/json',
      },
  });

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
  }

  public log(info: TransformableInfo, callback: LogCallback) {
    const { level } = info;

    let text: string;
    if (this.config.format) {
      const formattedInfo = this.config.format.transform(info);
      text = (formattedInfo as TransformableInfo)[MESSAGE];
    } else {
      const rawMessage = info.message;
      text = `[*${level.toUpperCase()}*] ${rawMessage}`;
    }
    // partial payload: defines only the "text" property
    const message = { text } as any;

    const payload: SlackPayload = {
      attachments: message.attachments || this.config.attachments,
      channel: message.channel || this.config.channel,
      icon_emoji: message.icon_emoji || this.config.icon_emoji,
      icon_url: message.icon_url || this.config.icon_url,
      link_names: message.link_names || this.config.link_names,
      text: message.text,
      unfurl_links: message.unfurl_links || this.config.unfurl_links,
      unfurl_media: message.unfurl_media || this.config.unfurl_media,
      username: message.username || this.config.username,
    };

    this.axios.post(this.config.webhook_url, payload)
        .then(() => {
            callback?.(null);
        })
        .catch((e: any) => {
            callback?.(e);
        });
  }
}
