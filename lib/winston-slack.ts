import * as request from 'request';
import { GenericTransportOptions, LogCallback, Transport, TransportOptions } from 'winston';

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
  fields: [{
    title: string;
    value: string;
    short: boolean
  }];
  image_url: string;
  thumb_url: string;
  footer: string;
  footer_icon: string;
  ts: number;
}

export interface SlackPayload {
  attachments: SlackAttachment[];
  channel: string;
  username: string;
  icon_url: string;
  icon_emoji: string;
  link_names: boolean;
  unfurl_links: boolean;
  unfurl_media: boolean;
  text: string;
}

export interface SlackTransportOptions extends GenericTransportOptions {
  webhook_url: string;
  channel?: string;
  username?: string;
  icon_url?: string;
  icon_emoji?: string;
  attachments?: SlackAttachment[];
  unfurl_links?: boolean;
  unfurl_media?: boolean;
  link_names?: boolean;
  custom_formatter?: (level: string, msg: string, meta: any) => SlackPayload;
}

export class SlackLogger extends Transport {
  private config: SlackTransportOptions;

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

  public log(level: string, msg: string, meta: any, callback: LogCallback) {
    let message;

    if (this.config.custom_formatter) {
      // custom_formatter returns a complete payload
      message = this.config.custom_formatter(level, msg, meta);
    } else {
      let text = `[*${level.toUpperCase()}*] ${msg}`;
      let metaTrace;
      if (meta instanceof Error) {
          try {
              metaTrace = JSON.stringify(meta);

              if (metaTrace && metaTrace !== '{}') {
                  text += `\n\`\`\`${metaTrace}\`\`\``;
              }
          } catch (e) {
              metaTrace = '';
          }
      }

      // partial payload: defines only the "text" property
      message = { text } as any;
    }

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

    request.post({
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' },
        uri: this.config.webhook_url,
      },
      (err: any, res?: request.Response, body?: any) => {
        if (err) {
          return callback && callback(err);
        }

        if (res && res.statusCode !== 200) {
          return callback(new Error(`Unexpected status code from Slack API: ${res.statusCode}`));
        }

        this.emit('logged');
        callback(null);
      },
    );
  }
}
