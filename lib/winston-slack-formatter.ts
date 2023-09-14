import * as winston from 'winston';

export const winstonSlackFormatter = winston.format((info) => {
    let stack = info.stack;
    if (stack) {
        stack = stack.map((s: any) => s
            ?.toString()
            ?.split(' + ')
            ?.join('\n'));
        info.stack = stack;
    }
    return info;
});
