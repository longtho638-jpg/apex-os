import { WebSocketServer, WebSocket } from 'ws';
import Redis from 'ioredis';
import jwt from 'jsonwebtoken';
import { IncomingMessage } from 'http';
import { CONFIG } from '../config';
import { Logger } from '../utils/logger';
import { AgentExecutionService } from '../services/agent-execution';

const redis = new Redis(CONFIG.REDIS_URL);
const logger = new Logger('WebSocketServer');
const agentService = new AgentExecutionService();

interface WSMessage {
    type: 'SUBSCRIBE' | 'UNSUBSCRIBE' | 'PING';
    symbols?: string[];
    userId?: string;
}

interface PriceUpdate {
    symbol: string;
    price: number;
    bid: number;
    ask: number;
    timestamp: number;
}

export class TradingWebSocketServer {
    private wss: WebSocketServer;
    private clients: Map<string, Set<WebSocket>> = new Map();

    constructor(port: number = Number(CONFIG.PORT)) {
        this.wss = new WebSocketServer({ port });
        this.setupHandlers();
        this.setupHeartbeat();
        this.startPriceUpdates();
        this.startAgentService();
        logger.info(`🔌 WebSocket Server running on port ${port}`);
    }

    private async startAgentService() {
        await agentService.start();
        logger.info('🤖 Agent Execution Service started');
    }

    private setupHandlers() {
        this.wss.on('connection', async (ws: WebSocket, req: IncomingMessage) => {
            // CRITICAL SECURITY FIX: WebSocket Authentication
            try {
                const url = new URL(req.url || '', `http://${req.headers.host}`);
                const token = url.searchParams.get('token');

                if (!token) {
                    logger.warn('❌ Connection rejected: Missing token');
                    ws.close(1008, 'Missing authentication token');
                    return;
                }

                const user = this.verifyToken(token);
                if (!user) {
                    logger.warn('❌ Connection rejected: Invalid token');
                    ws.close(1008, 'Invalid authentication token');
                    return;
                }

                // Attach user info to WS connection for later authorization checks
                (ws as any).user = user;
                (ws as any).isAlive = true;

                logger.info(`✅ Client connected: ${user.sub}`); // Log User ID

                ws.on('pong', () => {
                    (ws as any).isAlive = true;
                });

                ws.on('message', (data: Buffer) => {
                    try {
                        const message: WSMessage = JSON.parse(data.toString());
                        this.handleMessage(ws, message);
                    } catch (error) {
                        logger.error('❌ Invalid message:', error);
                    }
                });

                ws.on('close', () => {
                    logger.info(`❌ Client disconnected: ${user.sub}`);
                    this.removeClient(ws);
                });

                ws.on('error', (error) => {
                    logger.error('❌ WebSocket error:', error);
                });

            } catch (error) {
                logger.error('❌ Connection error:', error);
                ws.close(1011, 'Internal Server Error');
            }
        });
    }

    private verifyToken(token: string): any {
        try {
            // Use SUPABASE_JWT_SECRET or fallback to service role key if needed (but better to use JWT secret)
            const secret = process.env.SUPABASE_JWT_SECRET || process.env.JWT_SECRET;
            if (!secret) {
                throw new Error('Missing JWT_SECRET configuration');
            }
            return jwt.verify(token, secret);
        } catch (error) {
            return null;
        }
    }

    private setupHeartbeat() {
        const interval = setInterval(() => {
            this.wss.clients.forEach((ws) => {
                if ((ws as any).isAlive === false) {
                    logger.warn('⚠️ Terminating stale connection');
                    return ws.terminate();
                }

                (ws as any).isAlive = false;
                ws.ping();
            });
        }, 30000);

        this.wss.on('close', () => {
            clearInterval(interval);
        });
    }

    private handleMessage(ws: WebSocket, message: WSMessage) {
        const user = (ws as any).user;

        switch (message.type) {
            case 'SUBSCRIBE':
                if (message.symbols) {
                    // CRITICAL SECURITY FIX: Channel Authorization
                    const allowedSymbols = message.symbols.filter(symbol => {
                        // 1. Private User Channels (e.g., user:123:orders)
                        if (symbol.startsWith('user:')) {
                            const parts = symbol.split(':');
                            const targetUserId = parts[1];
                            if (targetUserId !== user.sub) {
                                logger.warn(`⚠️ Unauthorized subscription attempt by ${user.sub} to ${symbol}`);
                                return false;
                            }
                        }
                        // 2. Public Channels (e.g., BTC-USDT) - Allow all
                        return true;
                    });

                    if (allowedSymbols.length > 0) {
                        allowedSymbols.forEach(symbol => {
                            if (!this.clients.has(symbol)) {
                                this.clients.set(symbol, new Set());
                            }
                            this.clients.get(symbol)!.add(ws);
                        });
                        ws.send(JSON.stringify({
                            type: 'SUBSCRIBED',
                            symbols: allowedSymbols
                        }));
                        logger.debug(`User ${user.sub} subscribed to ${allowedSymbols.join(', ')}`);
                    }
                }
                break;

            case 'UNSUBSCRIBE':
                if (message.symbols) {
                    message.symbols.forEach(symbol => {
                        this.clients.get(symbol)?.delete(ws);
                    });
                    logger.debug(`Unsubscribed from ${message.symbols.join(', ')}`);
                }
                break;

            case 'PING':
                ws.send(JSON.stringify({ type: 'PONG' }));
                break;
        }
    }

    private removeClient(ws: WebSocket) {
        this.clients.forEach((clients, symbol) => {
            clients.delete(ws);
            if (clients.size === 0) {
                this.clients.delete(symbol);
            }
        });
    }

    private async startPriceUpdates() {
        // Subscribe to Redis pub/sub for price updates
        const subscriber = redis.duplicate();
        await subscriber.subscribe('price_updates');

        subscriber.on('message', (channel, message) => {
            if (channel === 'price_updates') {
                const update: PriceUpdate = JSON.parse(message);
                this.broadcastPrice(update);
            }
        });

        logger.info('📡 Subscribed to price updates');
    }

    private broadcastPrice(update: PriceUpdate) {
        const clients = this.clients.get(update.symbol);
        if (clients && clients.size > 0) {
            const data = JSON.stringify({
                type: 'PRICE_UPDATE',
                data: update
            });

            clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(data);
                }
            });
        }
    }
}

// Start server if run directly
if (require.main === module) {
    new TradingWebSocketServer(Number(CONFIG.PORT));
}
