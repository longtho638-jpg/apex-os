import { logger } from '@/lib/logger';
export class MarketMakerBot {
  private isRunning = false;
  private config = { spread: 0.002, orderSize: 1000 }; // 0.2% spread

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    logger.info('MM Bot Started');
    this.loop();
  }

  stop() {
    this.isRunning = false;
    logger.info('MM Bot Stopped');
  }

  private async loop() {
    while (this.isRunning) {
      try {
        // 1. Get Mid Price (Mock)
        const midPrice = 0.05; // APEX price

        // 2. Calculate Bid/Ask
        const buyPrice = midPrice * (1 - this.config.spread);
        const sellPrice = midPrice * (1 + this.config.spread);

        // 3. Place Orders (Mock Log)
        // In prod: Call exchange API
        logger.info(`[MM] Placing BID @ ${buyPrice} | ASK @ ${sellPrice}`);

        // 4. Wait 1s
        await new Promise(r => setTimeout(r, 1000));
      } catch (e) {
        logger.error('MM Loop Error', e);
      }
    }
  }
}

// Singleton instance
export const mmBot = new MarketMakerBot();
