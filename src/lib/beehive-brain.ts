import { notificationService, NotificationType } from './notification-service';
import { sendEmail } from './email-service';
import { emailTemplates } from './email-templates';
import { CRMService } from './crm-service';

interface BeehiveEvent {
    userId: string;
    type: string;
    data: any;
}

export class BeehiveBrain {
    private static instance: BeehiveBrain;

    private constructor() { }

    public static getInstance(): BeehiveBrain {
        if (!BeehiveBrain.instance) {
            BeehiveBrain.instance = new BeehiveBrain();
        }
        return BeehiveBrain.instance;
    }

    /**
     * The "Waggle Dance" - Decides how to push information to the user.
     */
    async decidePush(event: BeehiveEvent) {
        const { userId, type, data } = event;

        // 1. Determine Priority & Channel Strategy
        const strategy = this.getStrategy(type, data);

        // 2. Execute Strategy
        if (strategy.bell) {
            await notificationService.create({
                userId,
                type: strategy.level,
                title: strategy.title,
                message: strategy.message,
                actionUrl: strategy.actionUrl,
                metadata: data
            });
        }

        if (strategy.email) {
            // Check if we should suppress email (e.g. if user is online - for now we just send)
            // In a real app, we would check Presence here.
            await this.sendEmailPush(userId, strategy, data);
        }

        // 3. Update Ghost Profit (if applicable)
        if (type === 'SIGNAL_MISSED') {
            await CRMService.getInstance().updatePipelineMetadata(userId, {
                ghost_profit: data.potentialProfit // This would need an increment logic in DB or service
            });
        }
    }

    private getStrategy(type: string, data: any): {
        level: NotificationType;
        bell: boolean;
        email: boolean;
        title: string;
        message: string;
        actionUrl?: string;
        template?: string;
    } {
        switch (type) {
            case 'SIGNAL_HIGH_PROB':
                return {
                    level: 'NECTAR',
                    bell: true,
                    email: true,
                    title: '🍯 Honey Pot Detected',
                    message: `${data.symbol} Long. Confidence: ${data.confidence}%.`,
                    actionUrl: `/dashboard/trade?symbol=${data.symbol}`,
                    template: 'signalAlert' // We need to add this template
                };
            case 'MARKET_CRASH':
                return {
                    level: 'CRITICAL',
                    bell: true,
                    email: true,
                    title: '⚠️ Market Turbulence',
                    message: 'Protect your positions immediately.',
                    actionUrl: '/dashboard/portfolio',
                    template: 'marketAlert'
                };
            case 'WIN_STREAK':
                return {
                    level: 'NECTAR',
                    bell: true,
                    email: true,
                    title: '🔥 You are on Fire!',
                    message: '3 Wins in a row. Scale up?',
                    actionUrl: '/pricing',
                    template: 'winningStreak'
                };
            case 'RAGE_QUIT_RISK':
                return {
                    level: 'AMBIENT',
                    bell: true,
                    email: true,
                    title: '🛡️ Stop Loss Strategy',
                    message: 'Take a break. Read this guide on risk management.',
                    actionUrl: '/academy/risk-management',
                    template: 'stopLossGuide'
                };
            default:
                return {
                    level: 'AMBIENT',
                    bell: true,
                    email: false,
                    title: 'Notification',
                    message: 'You have a new update.',
                };
        }
    }

    private async sendEmailPush(userId: string, strategy: any, data: any) {
        // Fetch user email (mocked for now, in real app we get from Auth)
        // For now we assume the caller might pass email or we fetch it.
        // This part requires the user email.
        // Let's assume we have a method to get user email or it's passed in data.
        if (data.email && strategy.template) {
            // We need to map strategy.template to actual template function
            // This is a placeholder for the logic
            console.log(`Sending email template ${strategy.template} to ${data.email}`);
        }
    }
}

export const beehiveBrain = BeehiveBrain.getInstance();
