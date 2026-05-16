export interface Quote {
  symbol: string;
  name: string;
  price: number;
  previousClose: number;
  change: number;
  changePercent: number;
  dayHigh: number;
  dayLow: number;
  volume: number;
  marketCap: number;
  currency: string;
  exchange: string;
  timestamp: number;
}

export interface HistoricalData {
  symbol: string;
  timestamps: number[];
  opens: number[];
  highs: number[];
  lows: number[];
  closes: number[];
  volumes: number[];
}

export interface SearchResult {
  symbol: string;
  name: string;
  exchange: string;
  type: string;
}

interface YahooChartResponse {
  chart: {
    result: Array<{
      meta: {
        symbol: string;
        regularMarketPrice?: number;
        previousClose?: number;
        currency?: string;
        regularMarketDayHigh?: number;
        regularMarketDayLow?: number;
        regularMarketVolume?: number;
        marketCap?: number;
        shortName?: string;
        exchange?: string;
        exchangeTimezoneName?: string;
      };
      timestamp?: number[];
      indicators?: {
        quote: Array<{
          open?: (number | null)[];
          high?: (number | null)[];
          low?: (number | null)[];
          close?: (number | null)[];
          volume?: (number | null)[];
        }>;
      };
    }>;
    error?: {
      code: string;
      description: string;
    };
  };
}

interface YahooSearchResponse {
  quotes?: Array<{
    symbol: string;
    shortname?: string;
    longname?: string;
    exchange?: string;
    quoteType?: string;
  }>;
}

interface YahoTrendingResponse {
  finance?: {
    result?: Array<{
      quotes?: Array<{
        symbol: string;
        shortName?: string;
        exchange?: string;
        quoteType?: string;
      }>;
    }>;
  };
}

const QUOTE_CACHE = new Map<string, { data: Quote; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCachedQuote(symbol: string): Quote | null {
  const cached = QUOTE_CACHE.get(symbol);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  QUOTE_CACHE.delete(symbol);
  return null;
}

function setCachedQuote(symbol: string, quote: Quote): void {
  QUOTE_CACHE.set(symbol, { data: quote, timestamp: Date.now() });
}

export async function getQuote(symbol: string): Promise<Quote | null> {
  try {
    const cached = getCachedQuote(symbol);
    if (cached) {
      return cached;
    }

    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
      symbol
    )}?interval=1d&range=1d`;

    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      console.error(`Failed to fetch quote for ${symbol}: ${response.status}`);
      return null;
    }

    const data: YahooChartResponse = await response.json();

    if (!data.chart?.result?.[0]) {
      console.error(`No result for symbol ${symbol}`);
      return null;
    }

    const result = data.chart.result[0];
    const meta = result.meta;

    const currentPrice = meta.regularMarketPrice || 0;
    const previousClosePrice = meta.previousClose || 0;
    const change = currentPrice - previousClosePrice;
    const changePercent =
      previousClosePrice !== 0 ? (change / previousClosePrice) * 100 : 0;

    const quote: Quote = {
      symbol: meta.symbol || symbol,
      name: meta.shortName || symbol,
      price: currentPrice,
      previousClose: previousClosePrice,
      change,
      changePercent,
      dayHigh: meta.regularMarketDayHigh || 0,
      dayLow: meta.regularMarketDayLow || 0,
      volume: meta.regularMarketVolume || 0,
      marketCap: meta.marketCap || 0,
      currency: meta.currency || 'USD',
      exchange: meta.exchange || '',
      timestamp: Date.now(),
    };

    setCachedQuote(symbol, quote);
    return quote;
  } catch (error) {
    console.error(`Error fetching quote for ${symbol}:`, error);
    return null;
  }
}

export async function getQuotes(symbols: string[]): Promise<Quote[]> {
  try {
    const quotes = await Promise.all(
      symbols.map((symbol) => getQuote(symbol))
    );
    return quotes.filter((quote) => quote !== null) as Quote[];
  } catch (error) {
    console.error('Error fetching multiple quotes:', error);
    return [];
  }
}

export async function getHistory(
  symbol: string,
  range: string = '1y',
  interval: string = '1d'
): Promise<HistoricalData | null> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
      symbol
    )}?interval=${encodeURIComponent(interval)}&range=${encodeURIComponent(
      range
    )}`;

    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      console.error(
        `Failed to fetch history for ${symbol}: ${response.status}`
      );
      return null;
    }

    const data: YahooChartResponse = await response.json();

    if (!data.chart?.result?.[0]) {
      console.error(`No history result for symbol ${symbol}`);
      return null;
    }

    const result = data.chart.result[0];
    const timestamps = result.timestamp || [];
    const quotes = result.indicators?.quote?.[0] || {};

    const cleanArray = (arr: (number | null)[] | undefined): number[] => {
      return (arr || []).map((v) => (v === null ? 0 : v));
    };

    const historical: HistoricalData = {
      symbol: result.meta?.symbol || symbol,
      timestamps: timestamps,
      opens: cleanArray(quotes.open),
      highs: cleanArray(quotes.high),
      lows: cleanArray(quotes.low),
      closes: cleanArray(quotes.close),
      volumes: cleanArray(quotes.volume),
    };

    return historical;
  } catch (error) {
    console.error(`Error fetching history for ${symbol}:`, error);
    return null;
  }
}

export async function searchTicker(query: string): Promise<SearchResult[]> {
  try {
    const url = `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(
      query
    )}&quotesCount=10&newsCount=0`;

    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      console.error(`Failed to search tickers: ${response.status}`);
      return [];
    }

    const data: YahooSearchResponse = await response.json();

    if (!data.quotes || data.quotes.length === 0) {
      return [];
    }

    return data.quotes.map((quote) => ({
      symbol: quote.symbol,
      name: quote.longname || quote.shortname || quote.symbol,
      exchange: quote.exchange || '',
      type: quote.quoteType || 'EQUITY',
    }));
  } catch (error) {
    console.error('Error searching tickers:', error);
    return [];
  }
}
