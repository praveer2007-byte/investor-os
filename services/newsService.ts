export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  url: string;
  publishedAt: number;
  thumbnail?: string;
  relatedSymbols?: string[];
}

interface YahooNewsSearchResponse {
  news?: Array<{
    uuid?: string;
    title?: string;
    summary?: string;
    source?: string;
    link?: string;
    pubDate?: number;
    thumbnail?: {
      resolutions?: Array<{
        url?: string;
        width?: number;
        height?: number;
      }>;
    };
    relatedTickers?: string[];
  }>;
}

interface YahooTrendingResponse {
  finance?: {
    result?: Array<{
      quotes?: Array<{
        symbol?: string;
      }>;
    }>;
  };
}

const NEWS_CACHE = new Map<
  string,
  { data: NewsItem[]; timestamp: number }
>();
const NEWS_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

function getCachedNews(key: string): NewsItem[] | null {
  const cached = NEWS_CACHE.get(key);
  if (cached && Date.now() - cached.timestamp < NEWS_CACHE_TTL) {
    return cached.data;
  }
  NEWS_CACHE.delete(key);
  return null;
}

function setCachedNews(key: string, news: NewsItem[]): void {
  NEWS_CACHE.set(key, { data: news, timestamp: Date.now() });
}

function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function parseThumbnailUrl(thumbnail?: { resolutions?: Array<{ url?: string }> }): string | undefined {
  return thumbnail?.resolutions?.[0]?.url;
}

export async function getMarketNews(): Promise<NewsItem[]> {
  try {
    const cached = getCachedNews('market-news');
    if (cached) {
      return cached;
    }

    const url =
      'https://query1.finance.yahoo.com/v1/finance/search?q=market+news&newsCount=20&quotesCount=0';

    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      console.error(`Failed to fetch market news: ${response.status}`);
      return [];
    }

    const data: YahooNewsSearchResponse = await response.json();

    if (!data.news || data.news.length === 0) {
      return [];
    }

    const newsItems: NewsItem[] = data.news
      .slice(0, 20)
      .map((item) => ({
        id: item.uuid || generateId(),
        title: item.title || 'Untitled',
        summary: item.summary || '',
        source: item.source || 'Yahoo Finance',
        url: item.link || '',
        publishedAt: item.pubDate || Date.now(),
        thumbnail: parseThumbnailUrl(item.thumbnail),
        relatedSymbols: item.relatedTickers || [],
      }));

    setCachedNews('market-news', newsItems);
    return newsItems;
  } catch (error) {
    console.error('Error fetching market news:', error);
    return [];
  }
}

export async function getTickerNews(symbol: string): Promise<NewsItem[]> {
  try {
    const cacheKey = `ticker-news-${symbol.toUpperCase()}`;
    const cached = getCachedNews(cacheKey);
    if (cached) {
      return cached;
    }

    const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(
      symbol
    )}&newsCount=20&quotesCount=0`;

    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      console.error(
        `Failed to fetch news for ${symbol}: ${response.status}`
      );
      return [];
    }

    const data: YahooNewsSearchResponse = await response.json();

    if (!data.news || data.news.length === 0) {
      return [];
    }

    const newsItems: NewsItem[] = data.news
      .slice(0, 20)
      .map((item) => ({
        id: item.uuid || generateId(),
        title: item.title || 'Untitled',
        summary: item.summary || '',
        source: item.source || 'Yahoo Finance',
        url: item.link || '',
        publishedAt: item.pubDate || Date.now(),
        thumbnail: parseThumbnailUrl(item.thumbnail),
        relatedSymbols: item.relatedTickers || [],
      }));

    setCachedNews(cacheKey, newsItems);
    return newsItems;
  } catch (error) {
    console.error(`Error fetching news for ${symbol}:`, error);
    return [];
  }
}
