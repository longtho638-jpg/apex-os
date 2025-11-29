export enum LogLevel {
    INFO = 'INFO',
    WARN = 'WARN',
    ERROR = 'ERROR',
    DEBUG = 'DEBUG'
}

export class Logger {
    private serviceName: string;

    constructor(serviceName: string) {
        this.serviceName = serviceName;
    }

    private formatMessage(level: LogLevel, message: string, meta?: any): string {
        const timestamp = new Date().toISOString();
        const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
        return `[${timestamp}] [${this.serviceName}] [${level}] ${message}${metaStr}`;
    }

    info(message: string, meta?: any) {
        console.log(this.formatMessage(LogLevel.INFO, message, meta));
    }

    warn(message: string, meta?: any) {
        console.warn(this.formatMessage(LogLevel.WARN, message, meta));
    }

    error(message: string, error?: any) {
        console.error(this.formatMessage(LogLevel.ERROR, message, error));
    }

    debug(message: string, meta?: any) {
        if (process.env.DEBUG) {
            console.debug(this.formatMessage(LogLevel.DEBUG, message, meta));
        }
    }
}
