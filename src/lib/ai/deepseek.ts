import { createClient } from '@supabase/supabase-js';

const DEEPSEEK_API_URL = 'https://openrouter.ai/api/v1';

export interface DeepSeekMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface DeepSeekResponse {
    id: string;
    choices: {
        message: {
            content: string;
            role: string;
        };
        finish_reason: string;
    }[];
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}

export class DeepSeekClient {
    private apiKey: string;

    constructor(apiKey?: string) {
        // Use OPENROUTER_API_KEY as primary source
        this.apiKey = apiKey || process.env.OPENROUTER_API_KEY || '';
        if (!this.apiKey) {
            console.warn('OpenRouter API Key is missing');
        }
    }

    async chatCompletion(messages: DeepSeekMessage[], temperature: number = 0.7): Promise<DeepSeekResponse> {
        if (!this.apiKey) {
            throw new Error('OpenRouter API Key is required');
        }

        const response = await fetch(`${DEEPSEEK_API_URL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`,
                'HTTP-Referer': 'https://apexrebate.com', // Required by OpenRouter
                'X-Title': 'ApexOS Quant Brain',
            },
            body: JSON.stringify({
                model: 'deepseek/deepseek-chat', // OpenRouter model ID
                messages,
                temperature,
                stream: false
            })
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`DeepSeek API Error: ${response.status} - ${error}`);
        }

        return await response.json();
    }

    /**
     * Specialized method for Quant Analysis
     * Forces DeepSeek to output structured JSON strategy
     */
    async generateQuantStrategy(marketContext: string): Promise<any> {
        const systemPrompt = `
You are "The General" (Sun Tzu of Trading) - a Senior Quantitative AI.
Your philosophy is based on The Art of War:
1. "Know the enemy and know yourself": Analyze market structure (Enemy) and risk parameters (Yourself).
2. "Win without fighting": The best trade is NO trade if the edge is weak. Capital preservation is victory.
3. "Attack where they are unprepared": Look for asymmetric risk/reward setups (Breakouts, Liquidation Cascades).
4. "Move swift as the wind": Identify momentum setups that minimize time in the market.

Analyze the provided market context.
If the probability of success is < 70%, your signal MUST be "NEUTRAL". Do not force trades.

Output MUST be valid JSON with the following structure:
{
    "signal": "LONG" | "SHORT" | "NEUTRAL",
    "confidence": number (0-100),
    "entry_zone": { "min": number, "max": number },
    "stop_loss": number,
    "take_profit_targets": [number, number, number],
    "leverage_limit": number,
    "reasoning": "Explain using Sun Tzu metaphors (e.g., 'Ambush at support', 'Retreat to preserve capital'). Be concise."
}
        `;

        const response = await this.chatCompletion([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: marketContext }
        ], 0.2); // Low temperature for deterministic output

        try {
            const content = response.choices[0].message.content;
            // Strip markdown code blocks if present
            const jsonStr = content.replace(/```json\n|\n```/g, '');
            return JSON.parse(jsonStr);
        } catch (e) {
            console.error('Failed to parse DeepSeek strategy:', e);
            throw new Error('Invalid JSON response from DeepSeek');
        }
    }

    /**
     * Specialized method for Volume/Rebate Farming Strategy
     * Focuses on Delta Neutral, High Turnover, and Capital Preservation
     */
    async generateVolumeStrategy(marketContext: string, userTier: string): Promise<any> {
        const systemPrompt = `
You are "The Farmer" - a Senior Quantitative AI specializing in Market Making and Rebate Arbitrage.
Your goal is NOT to predict price direction, but to MAXIMIZE TRADING VOLUME while maintaining DELTA NEUTRALITY (Zero Risk).

Target Audience: Users who want to "farm" rebates (commission kickbacks) from exchanges.
Strategy Focus:
1. "High Turnover": Execute many small trades to generate volume.
2. "Delta Neutral": Hedge positions (e.g., Long Perp + Short Futures) to eliminate price risk.
3. "Grid Trading": Profit from volatility within a range.

Analyze the market context. Suggest a setup that maximizes volume with minimal directional risk.

Output MUST be valid JSON:
{
    "strategy_type": "GRID_BOT" | "DELTA_NEUTRAL_HEDGE" | "HIGH_FREQ_SCALP",
    "pair": string,
    "leverage": number (SAFE leverage for volume, e.g., 5x-10x),
    "grid_range": { "low": number, "high": number, "grids": number },
    "hedge_ratio": number (e.g., 1.0 for perfect hedge),
    "estimated_volume_24h": number,
    "estimated_rebate_earnings": number,
    "reasoning": "Explain why this pair/range is good for farming (e.g., 'High volatility, low spread')."
}
        `;

        const response = await this.chatCompletion([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `User Tier: ${userTier}\n${marketContext}` }
        ], 0.2);

        try {
            const content = response.choices[0].message.content;
            const jsonStr = content.replace(/```json\n|\n```/g, '');
            return JSON.parse(jsonStr);
        } catch (e) {
            console.error('Failed to parse DeepSeek volume strategy:', e);
            throw new Error('Invalid JSON response from DeepSeek');
        }
    }
}

export const deepseek = new DeepSeekClient();
