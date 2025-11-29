/**
 * Notification Service
 * Handles sending system alerts and notifications
 */

export type AlertLevel = 'info' | 'warning' | 'error' | 'critical';

export interface AlertOptions {
    title: string;
    message: string;
    level: AlertLevel;
    metadata?: Record<string, any>;
    source?: string;
}

export class NotificationService {
    /**
     * Send a system alert
     */
    static async sendAlert(options: AlertOptions): Promise<void> {
        const { title, message, level, metadata, source } = options;

        // 1. Console Log (Structured)
        const logEntry = {
            timestamp: new Date().toISOString(),
            type: 'ALERT',
            level,
            title,
            message,
            source: source || 'system',
            metadata
        };

        if (level === 'error' || level === 'critical') {
            console.error(JSON.stringify(logEntry));
        } else if (level === 'warning') {
            console.warn(JSON.stringify(logEntry));
        } else {
            console.log(JSON.stringify(logEntry));
        }

        // 2. Slack Integration
        if (process.env.SLACK_WEBHOOK_URL && (level === 'error' || level === 'critical')) {
            try {
                await fetch(process.env.SLACK_WEBHOOK_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        text: `🚨 *${level.toUpperCase()}: ${title}*\n${message}\nSource: ${source || 'system'}`,
                        blocks: [
                            {
                                type: "section",
                                text: {
                                    type: "mrkdwn",
                                    text: `🚨 *${level.toUpperCase()}: ${title}*\n${message}`
                                }
                            },
                            {
                                type: "context",
                                elements: [
                                    {
                                        type: "mrkdwn",
                                        text: `Source: ${source || 'system'} | Time: ${new Date().toISOString()}`
                                    }
                                ]
                            }
                        ]
                    })
                });
            } catch (err) {
                console.error('Failed to send Slack alert:', err);
            }
        }
    }
}
