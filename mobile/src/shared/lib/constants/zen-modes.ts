export type Element = 'FIRE' | 'WATER' | 'EARTH' | 'METAL' | 'WOOD';
export type ViewMode = 'QUANT' | 'ZEN';

export interface TraderDNA {
    primaryElement: Element;
    elementScores: Record<Element, number>;
    alphaWindow: { start: string; end: string };
    nemesis: string;
    winRate: number;
}

export interface QuantMetrics {
    discipline: number;      // 0-100
    riskAppetite: number;   // 0-100
    consistency: number;    // 0-100
    behavioralBias: string;
}

export interface ElementProfile {
    name: Element;
    code: string;
    icon: string;
    color: string;
    glowColor: string;
    counterElement: string;
}

export const ELEMENTS: ElementProfile[] = [
    {
        name: 'FIRE',
        code: 'HF_SCPL',
        icon: '⚡',
        color: '#FF0080',
        glowColor: 'rgba(255, 0, 128, 0.5)',
        counterElement: 'WATER (Market Dump)'
    },
    {
        name: 'WATER',
        code: 'SWG_TRD',
        icon: '〰️',
        color: '#00F0FF',
        glowColor: 'rgba(0, 240, 255, 0.5)',
        counterElement: 'EARTH (Sideways)'
    },
    {
        name: 'EARTH',
        code: 'POS_HLD',
        icon: '◼',
        color: '#FFD700',
        glowColor: 'rgba(255, 215, 0, 0.5)',
        counterElement: 'WOOD (FOMO Pumps)'
    },
    {
        name: 'METAL',
        code: 'ALG_BOT',
        icon: '⬡',
        color: '#C0C0C0',
        glowColor: 'rgba(192, 192, 192, 0.5)',
        counterElement: 'FIRE (Volatility)'
    },
    {
        name: 'WOOD',
        code: 'GRW_INV',
        icon: '▲',
        color: '#00FF00',
        glowColor: 'rgba(0, 255, 0, 0.5)',
        counterElement: 'METAL (Regulation)'
    }
];

export const MOCK_TRADER_DNA: TraderDNA = {
    primaryElement: 'FIRE',
    elementScores: {
        FIRE: 85,
        WATER: 45,
        EARTH: 30,
        METAL: 60,
        WOOD: 25
    },
    alphaWindow: { start: '09:30', end: '11:00' },
    nemesis: 'SOL/USDT',
    winRate: 62
};
