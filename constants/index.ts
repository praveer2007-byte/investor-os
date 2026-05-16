export const APP_NAME = 'InvestorOS';
export const APP_TAGLINE = 'Wealth. Systems. Discipline.';
export const APP_VERSION = '1.0.0';

export const TIERS = {
  FREE: 'free',
  PLUS: 'plus',
  PRO: 'pro',
} as const;

export type Tier = (typeof TIERS)[keyof typeof TIERS];

export interface Timeframe {
  label: string;
  value:
    | '1d'
    | '5d'
    | '1mo'
    | '6mo'
    | 'ytd'
    | '1y'
    | '5y'
    | '10y'
    | 'max';
}

export const TIMEFRAMES: ReadonlyArray<Timeframe> = [
  { label: '1D', value: '1d' },
  { label: '1W', value: '5d' },
  { label: '1M', value: '1mo' },
  { label: '6M', value: '6mo' },
  { label: 'YTD', value: 'ytd' },
  { label: '1Y', value: '1y' },
  { label: '5Y', value: '5y' },
  { label: '10Y', value: '10y' },
  { label: 'Max', value: 'max' },
];

export interface Benchmark {
  label: string;
  symbol: string;
}

export const BENCHMARKS: ReadonlyArray<Benchmark> = [
  { label: 'S&P 500', symbol: '^GSPC' },
  { label: 'NASDAQ', symbol: '^IXIC' },
  { label: 'STI', symbol: '^STI' },
  { label: 'DJIA', symbol: '^DJI' },
  { label: 'FTSE 100', symbol: '^FTSE' },
  { label: 'Nikkei', symbol: '^N225' },
];

export interface AIPersonality {
  id: string;
  label: string;
  description: string;
}

export const AI_PERSONALITIES: ReadonlyArray<AIPersonality> = [
  { id: 'conservative', label: 'Conservative', description: 'Stable, defensive analysis' },
  { id: 'moderate', label: 'Moderate', description: 'Balanced opportunities' },
  { id: 'aggressive', label: 'Aggressive', description: 'Growth-focused analysis' },
  { id: 'statistical', label: 'Statistical', description: 'Ratio & data-driven' },
  { id: 'educational', label: 'Educational', description: 'Simplified explanations' },
  { id: 'macro', label: 'Macro', description: 'Macro & global economy' },
];
