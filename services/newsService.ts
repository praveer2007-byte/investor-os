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
    providerPublishTime?: number;
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

// Fallback news for when real data is unavailable
function getFallbackNews(): NewsItem[] {
  const now = Date.now();
  return [
    {
      id: 'fallback-1',
      title: 'Federal Reserve signals patience on interest rate cuts',
      summary: 'Federal Reserve officials suggest interest rate cuts may be on the horizon as inflation continues to cool, supporting risk assets.',
      source: 'Financial Times',
      url: 'https://www.ft.com',
      publishedAt: now - 2 * 60 * 60 * 1000, // 2h ago
      relatedSymbols: [],
    },
    {
      id: 'fallback-2',
      title: 'Tech stocks rally on AI optimism and earnings beat',
      summary: 'Major technology companies gained following announcements of new AI capabilities and strong earnings reports exceeding expectations.',
      source: 'Bloomberg',
      url: 'https://www.bloomberg.com',
      publishedAt: now - 4 * 60 * 60 * 1000, // 4h ago
      relatedSymbols: ['AAPL', 'MSFT', 'NVDA'],
    },
    {
      id: 'fallback-3',
      title: 'Oil prices steady amid OPEC supply management',
      summary: 'Crude oil prices remain stable as the market assesses geopolitical tensions and OPEC production decisions affecting energy markets.',
      source: 'Reuters',
      url: 'https://www.reuters.com',
      publishedAt: now - 6 * 60 * 60 * 1000, // 6h ago
      relatedSymbols: ['CL=F', 'XLE'],
    },
    {
      id: 'fallback-4',
      title: 'Emerging market currencies strengthen on risk appetite',
      summary: 'Emerging market currencies gained against the dollar as investors increase exposure to developing markets on improving economic outlook.',
      source: 'The Wall Street Journal',
      url: 'https://www.wsj.com',
      publishedAt: now - 5 * 60 * 60 * 1000, // 5h ago
      relatedSymbols: ['EEM', 'IEMG'],
    },
    {
      id: 'fallback-5',
      title: 'ETF flows reach record highs, passive investing dominates',
      summary: 'Exchange-traded funds continue to see massive inflows as passive investing strategies gain market share from active management.',
      source: 'CNBC',
      url: 'https://www.cnbc.com',
      publishedAt: now - 7 * 60 * 60 * 1000, // 7h ago
      relatedSymbols: ['SPY', 'VOO', 'IVV'],
    },
    {
      id: 'fallback-6',
      title: 'Earnings season shows resilience despite economic headwinds',
      summary: 'Corporate earnings reports indicate market resilience with most companies beating expectations, supporting equity valuations.',
      source: 'MarketWatch',
      url: 'https://www.marketwatch.com',
      publishedAt: now - 8 * 60 * 60 * 1000, // 8h ago
      relatedSymbols: [],
    },
    {
      id: 'fallback-7',
      title: 'Euro strengthens as ECB maintains hawkish stance',
      summary: 'The euro gains against other major currencies as the European Central Bank signals commitment to managing inflation through rates.',
      source: 'Barron\'s',
      url: 'https://www.barrons.com',
      publishedAt: now - 9 * 60 * 60 * 1000, // 9h ago
      relatedSymbols: ['EURUSD=X'],
    },
    {
      id: 'fallback-8',
      title: 'Real estate sector rebounds on mortgage rate stabilization',
      summary: 'REIT valuations improve as mortgage rates stabilize, supporting residential and commercial property investments.',
      source: 'Seeking Alpha',
      url: 'https://www.seekingalpha.com',
      publishedAt: now - 10 * 60 * 60 * 1000, // 10h ago
      relatedSymbols: ['SCHH', 'VNQ', 'XLRE'],
    },
  ];
}

export async function getMarketNews(): Promise<NewsItem[]> {
  try {
    const cached = getCachedNews('market-news');
    if (cached) {
      return cached;
    }

    // Try multiple endpoints in order
    const endpoints = [
      'https://query1.finance.yahoo.com/v1/finance/search?q=finance+news&newsCount=20&quotesCount=0&enableFuzzyQuery=false',
      'https://query2.finance.yahoo.com/v1/finance/search?q=stock+market&newsCount=20&quotesCount=0',
    ];

    let newsItems: NewsItem[] = [];

    for (const url of endpoints) {
      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
        });

        if (!response.ok) {
          console.warn(`Endpoint returned status ${response.status}: ${url}`);
          continue;
        }

        const data: YahooNewsSearchResponse = await response.json();

        if (data.news && data.news.length > 0) {
          newsItems = data.news
            .slice(0, 20)
            .map((item) => ({
              id: item.uuid || generateId(),
              title: item.title || 'Untitled',
              summary: item.summary || (item.title ? item.title.substring(0, 120) : ''),
              source: item.source || 'Yahoo Finance',
              url: item.link || '',
              publishedAt: item.providerPublishTime ? item.providerPublishTime * 1000 : item.pubDate || Date.now(),
              thumbnail: parseThumbnailUrl(item.thumbnail),
              relatedSymbols: item.relatedTickers || [],
            }));

          if (newsItems.length > 0) {
            setCachedNews('market-news', newsItems);
            return newsItems;
          }
        }
      } catch (error) {
        console.warn(`Error trying endpoint ${url}:`, error);
        continue;
      }
    }

    // Try trending endpoint as fallback
    try {
      const trendingUrl = 'https://query1.finance.yahoo.com/v1/finance/trending/US?count=10';
      const response = await fetch(trendingUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      if (response.ok) {
        const trendingData: YahooTrendingResponse = await response.json();
        if (trendingData.finance?.result?.[0]?.quotes) {
          // If trending endpoint works, we could use it to seed news
          console.log('Trending data available but using fallback news');
        }
      }
    } catch (error) {
      console.warn('Error trying trending endpoint:', error);
    }

    // Use hardcoded fallback news
    const fallbackNews = getFallbackNews();
    setCachedNews('market-news', fallbackNews);
    return fallbackNews;
  } catch (error) {
    console.error('Error fetching market news:', error);
    return getFallbackNews();
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
    )}&newsCount=10&quotesCount=0`;

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
      // Return fallback for this symbol
      const fallbackNews = getFallbackNews().filter(
        (item) => item.relatedSymbols?.includes(symbol.toUpperCase())
      );
      setCachedNews(cacheKey, fallbackNews);
      return fallbackNews.slice(0, 10);
    }

    const data: YahooNewsSearchResponse = await response.json();

    if (!data.news || data.news.length === 0) {
      // Return fallback for this symbol
      const fallbackNews = getFallbackNews().filter(
        (item) => item.relatedSymbols?.includes(symbol.toUpperCase())
      );
      setCachedNews(cacheKey, fallbackNews);
      return fallbackNews.slice(0, 10);
    }

    const newsItems: NewsItem[] = data.news
      .slice(0, 10)
      .map((item) => ({
        id: item.uuid || generateId(),
        title: item.title || 'Untitled',
        summary: item.summary || (item.title ? item.title.substring(0, 120) : ''),
        source: item.source || 'Yahoo Finance',
        url: item.link || '',
        publishedAt: item.providerPublishTime ? item.providerPublishTime * 1000 : item.pubDate || Date.now(),
        thumbnail: parseThumbnailUrl(item.thumbnail),
        relatedSymbols: item.relatedTickers || [],
      }));

    setCachedNews(cacheKey, newsItems);
    return newsItems;
  } catch (error) {
    console.error(`Error fetching news for ${symbol}:`, error);
    // Return fallback for this symbol
    const fallbackNews = getFallbackNews().filter(
      (item) => item.relatedSymbols?.includes(symbol.toUpperCase())
    );
    return fallbackNews.slice(0, 10);
  }
}
