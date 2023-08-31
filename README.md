Based on [wja-no/winston-slack](https://github.com/wja-no/winston-slack).
Rewritten in TypeScript.

---

[Winston](https://github.com/winstonjs/winston) Transport for
[Slack](https://slack.com/) chat integration.

    npm install --save @aaaahoang123/winston-slack

Basic transport that works just like all other winston transports. Sends logged
messages to a specified Slack chat channel.

Configuration options:

 * `webhook_url`: **required** The webhook URL, something like
   `https://hooks.slack.com/services/XXXXXXXXX/YYYYYYYYY/ZZZZZZZZZZZZZZZZZZZZZZZZ`
 * `level`: If specified, this logger will only log messages at the specified
   level of importance and more important messages
 * `format`: use require('logform').Format as original winston
```js
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, prettyPrint } = format;

{
    format: combine(
           label({ label: 'right meow!' }),
           timestamp(),
           prettyPrint()
   )
}
```

Additionally, you can specify any Slack message parameters (such as `username`
and `channel`), and it will be applied as a fallback if the given argument is
not specified per message.

---

    var winston = require('winston');
    var Slack = require('@aaaahoang123/winston-slack');

    winston.add(Slack, {
        webhook_url: "https://hooks.slack.com/services/XXXXXXXXX/YYYYYYYYY/ZZZZZZZZZZZZZZZZZZZZZZZZ",
        channel: "#test-channel",
        username: "ErrorBot",
        level: 'error',
        handleExceptions: true
    });
