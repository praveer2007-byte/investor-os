import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getMarketNews, NewsItem as ServiceNewsItem } from '../../services/newsService';
import { getQuotes, Quote } from '../../services/yahooFinance';

const MATTE_BLACK = '#0A0A0A';
const GOLD = '#C9A84C';
const WHITE = '#FFFFFF';
const DARK_GRAY = '#1A1A1A';
const LIGHT_GRAY = '#999999';

interface NewsItem extends ServiceNewsItem {
  timeAgo: string;
}

interface BenchmarkStats {
  metric: string;
  yourPortfolio: string;
  benchmark: string;
  outperforming: boolean;
}

interface BenchmarkQuote {
  name: string;
  symbol: string;
  price: number;
  changePercent: number;
  change: number;
}

type CategoryFilter = 'All' | 'Macro' | 'Tech' | 'Energy' | 'Markets' | 'ETFs';

export default function MarketsScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'news' | 'benchmarks'>('news');
  const [searchInput, setSearchInput] = useState('');
  const [allNews, setAllNews] = useState<NewsItem[]>([]);
  const [displayedNews, setDisplayedNews] = useState<NewsItem[]>([]);
  const [selectedBenchmark, setSelectedBenchmark] = useState('S&P 500');
  const [selectedTimeframe, setSelectedTimeframe] = useState('1M');
  const [isLoadingNews, setIsLoadingNews] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('All');
  const [benchmarkQuote, setBenchmarkQuote] = useState<BenchmarkQuote | null>(null);
  const [isLoadingBenchmark, setIsLoadingBenchmark] = useState(false);

  const benchmarks = ['S&P 500', 'NASDAQ', 'STI', 'DJIA', 'FTSE 100', 'Nikkei'];
  const benchmarkSymbols: Record<string, string> = {
    'S&P 500': '^GSPC',
    'NASDAQ': '^IXIC',
    'STI': '^STI',
    'DJIA': '^DJI',
    'FTSE 100': '^FTSE',
    'Nikkei': '^N225',
  };
  const timeframes = ['1M', '6M', 'YTD', '1Y', '5Y'];
  const categories: CategoryFilter[] = ['All', 'Macro', 'Tech', 'Energy', 'Markets', 'ETFs'];

  const benchmarkStats: BenchmarkStats[] = [
    { metric: 'Total Return', yourPortfolio: '+12.4%', benchmark: '+8.2%', outperforming: true },
    { metric: 'Annualized', yourPortfolio: '+11.2%', benchmark: '+7.8%', outperforming: true },
    { metric: 'Best Month', yourPortfolio: '+8.3%', benchmark: '+5.1%', outperforming: true },
    { metric: 'Worst Month', yourPortfolio: '-4.2%', benchmark: '-6.8%', outperforming: true },
    { metric: 'Volatility', yourPortfolio: '14.2%', benchmark: '12.8%', outperforming: false },
    { metric: 'Sharpe Ratio', yourPortfolio: '1.24', benchmark: '0.89', outperforming: true },
  ];

  // Utility functions
  function getTimeAgo(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'just now';
  }

  function getSourceColor(source: string): string {
    const colors: Record<string, string> = {
      'Reuters': '#1E88E5',
      'Bloomberg': '#FF9800',
      'CNBC': '#D32F2F',
      'Financial Times': '#E91E63',
      'The Wall Street Journal': '#757575',
      'MarketWatch': '#FFC107',
      "Barron's": '#9C27B0',
      'Seeking Alpha': '#4CAF50',
    };
    return colors[source] || '#FFD700';
  }

  function categorizeNews(title: string): string[] {
    const categories: string[] = [];
    const titleLower = title.toLowerCase();

    if (/fed|inflation|rate|gdp|economy|central bank|dollar|yen/i.test(titleLower)) {
      categories.push('Macro');
    }
    if (/tech|ai|apple|microsoft|nvidia|semiconductor|google|amazon|meta|tesla/i.test(titleLower)) {
      categories.push('Tech');
    }
    if (/oil|gas|energy|opec|crude|renewable|solar|wind/i.test(titleLower)) {
      categories.push('Energy');
    }
    if (/etf|fund|index|vanguard|blackrock|ishares|spdr|passive/i.test(titleLower)) {
      categories.push('ETFs');
    }
    if (/s&p|nasdaq|rally|selloff|market|dow|index|equity|stock/i.test(titleLower)) {
      categories.push('Markets');
    }

    return categories;
  }

  function matchesCategory(title: string, category: CategoryFilter): boolean {
    if (category === 'All') return true;
    const categories = categorizeNews(title);
    return categories.includes(category);
  }

  // Fetch news on mount
  useEffect(() => {
    const loadNews = async () => {
      setIsLoadingNews(true);
      try {
        const news = await getMarketNews();
        const newsWithTimeAgo = news.map((item) => ({
          ...item,
          timeAgo: getTimeAgo(item.publishedAt),
        }));
        setAllNews(newsWithTimeAgo);
        filterNews(newsWithTimeAgo, selectedCategory, searchInput);
      } catch (error) {
        console.error('Error loading news:', error);
      } finally {
        setIsLoadingNews(false);
      }
    };

    loadNews();
  }, []);

  // Filter news based on category and search
  function filterNews(news: NewsItem[], category: CategoryFilter, search: string) {
    let filtered = news.filter((item) => matchesCategory(item.title, category));

    if (search.length > 0) {
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(search.toLowerCase()) ||
          item.source.toLowerCase().includes(search.toLowerCase())
      );
    }

    setDisplayedNews(filtered);
  }

  // Handle search
  const handleSearchNews = (text: string) => {
    setSearchInput(text);
    filterNews(allNews, selectedCategory, text);
  };

  // Handle category filter
  const handleCategoryFilter = (category: CategoryFilter) => {
    setSelectedCategory(category);
    filterNews(allNews, category, searchInput);
  };

  // Fetch benchmark data
  const loadBenchmarkData = async (benchmarkName: string) => {
    setIsLoadingBenchmark(true);
    try {
      const symbol = benchmarkSymbols[benchmarkName];
      if (symbol) {
        const quotes = await getQuotes([symbol]);
        if (quotes.length > 0) {
          const quote = quotes[0];
          setBenchmarkQuote({
            name: benchmarkName,
            symbol: quote.symbol,
            price: quote.price,
            change: quote.change,
            changePercent: quote.changePercent,
          });
        }
      }
    } catch (error) {
      console.error('Error loading benchmark data:', error);
    } finally {
      setIsLoadingBenchmark(false);
    }
  };

  // Load benchmark data when selected benchmark changes
  useEffect(() => {
    loadBenchmarkData(selectedBenchmark);
  }, [selectedBenchmark]);

  // Handle pull to refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const news = await getMarketNews();
      const newsWithTimeAgo = news.map((item) => ({
        ...item,
        timeAgo: getTimeAgo(item.publishedAt),
      }));
      setAllNews(newsWithTimeAgo);
      filterNews(newsWithTimeAgo, selectedCategory, searchInput);
    } catch (error) {
      console.error('Error refreshing news:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const renderNewsCard = (item: NewsItem) => (
    <TouchableOpacity
      key={item.id}
      style={styles.newsCard}
      onPress={() => item.url && Linking.openURL(item.url)}
    >
      <View style={styles.newsHeader}>
        <View style={styles.newsTitle}>
          <Text style={styles.newsHeading}>{item.title}</Text>
        </View>
        <TouchableOpacity style={styles.menuButton}>
          <Text style={styles.menuText}>⋯</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.newsSummary}>{item.summary}</Text>
      <View style={styles.newsFooter}>
        <View style={[styles.sourceBadge, { backgroundColor: getSourceColor(item.source) }]}>
          <Text style={styles.newsSource}>{item.source}</Text>
        </View>
        <Text style={styles.newsTime}>{item.timeAgo}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderLoadingSkeleton = () => (
    <View style={styles.newsList}>
      {[0, 1, 2].map((idx) => (
        <View key={`skeleton-${idx}`} style={styles.skeletonCard}>
          <View style={styles.skeletonLine} />
          <View style={[styles.skeletonLine, { width: '80%', marginTop: 8 }]} />
          <View style={[styles.skeletonLine, { width: '60%', marginTop: 8 }]} />
        </View>
      ))}
    </View>
  );

  const renderBenchmarkStat = (stat: BenchmarkStats, idx: number) => (
    <View key={idx} style={styles.statRow}>
      <Text style={styles.statMetric}>{stat.metric}</Text>
      <View style={styles.statValues}>
        <Text
          style={[
            styles.statValue,
            {
              color: stat.outperforming ? '#4CAF50' : LIGHT_GRAY,
            },
          ]}
        >
          {stat.yourPortfolio}
        </Text>
        <Text style={styles.statValue}>{stat.benchmark}</Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'news' && styles.activeTab]}
          onPress={() => setActiveTab('news')}
        >
          <Text style={[styles.tabText, activeTab === 'news' && styles.activeTabText]}>News</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'benchmarks' && styles.activeTab]}
          onPress={() => setActiveTab('benchmarks')}
        >
          <Text style={[styles.tabText, activeTab === 'benchmarks' && styles.activeTabText]}>Benchmarks</Text>
        </TouchableOpacity>
      </View>

      {/* News Tab */}
      {activeTab === 'news' && (
        <View style={styles.content}>
          {/* Search Bar */}
          <View style={styles.searchBarContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search news..."
              placeholderTextColor={LIGHT_GRAY}
              value={searchInput}
              onChangeText={handleSearchNews}
            />
          </View>

          {/* Category Filter Chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryChip,
                  selectedCategory === category && styles.activeCategoryChip,
                ]}
                onPress={() => handleCategoryFilter(category)}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    selectedCategory === category && styles.activeCategoryChipText,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* News List */}
          {isLoadingNews ? (
            <ScrollView showsVerticalScrollIndicator={false}>
              {renderLoadingSkeleton()}
              <View style={{ height: 50 }} />
            </ScrollView>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={GOLD} />}
            >
              {displayedNews.length > 0 ? (
                <>
                  <View style={styles.newsList}>
                    {displayedNews.map((item) => renderNewsCard(item))}
                  </View>
                  <View style={{ height: 50 }} />
                </>
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No news found</Text>
                </View>
              )}
            </ScrollView>
          )}
        </View>
      )}

      {/* Benchmarks Tab */}
      {activeTab === 'benchmarks' && (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <Text style={styles.benchmarkHeader}>Compare Your Portfolio</Text>

          {/* Benchmark Selector */}
          <View style={styles.benchmarkSelectorContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.benchmarkScroll}>
              {benchmarks.map((bench) => (
                <TouchableOpacity
                  key={bench}
                  style={[
                    styles.benchmarkChip,
                    selectedBenchmark === bench && styles.activeBenchmarkChip,
                  ]}
                  onPress={() => setSelectedBenchmark(bench)}
                >
                  <Text
                    style={[
                      styles.benchmarkChipText,
                      selectedBenchmark === bench && styles.activeBenchmarkChipText,
                    ]}
                  >
                    {bench}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Benchmark Quote Card */}
          {isLoadingBenchmark ? (
            <View style={styles.quoteCard}>
              <ActivityIndicator size="small" color={GOLD} />
            </View>
          ) : benchmarkQuote ? (
            <View style={styles.quoteCard}>
              <View style={styles.quoteHeader}>
                <View>
                  <Text style={styles.quoteName}>{benchmarkQuote.name}</Text>
                  <Text style={styles.quoteSymbol}>{benchmarkQuote.symbol}</Text>
                </View>
                <View style={styles.quotePrice}>
                  <Text style={styles.quotePriceValue}>${benchmarkQuote.price.toFixed(2)}</Text>
                  <Text
                    style={[
                      styles.quoteChange,
                      { color: benchmarkQuote.change >= 0 ? '#4CAF50' : '#F44336' },
                    ]}
                  >
                    {benchmarkQuote.change >= 0 ? '+' : ''}
                    {benchmarkQuote.changePercent.toFixed(2)}%
                  </Text>
                </View>
              </View>
            </View>
          ) : null}

          {/* Timeframe Selector */}
          <View style={styles.timeframeContainer}>
            {timeframes.map((tf) => (
              <TouchableOpacity
                key={tf}
                style={[styles.timeframeChip, selectedTimeframe === tf && styles.activeTimeframe]}
                onPress={() => setSelectedTimeframe(tf)}
              >
                <Text
                  style={[
                    styles.timeframeText,
                    selectedTimeframe === tf && styles.activeTimeframeText,
                  ]}
                >
                  {tf}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Chart Placeholder */}
          <View style={styles.chartContainer}>
            <View style={styles.chartContent}>
              <View style={styles.yAxis}>
                <Text style={styles.axisLabel}>+15%</Text>
                <Text style={styles.axisLabel}>0%</Text>
                <Text style={styles.axisLabel}>-15%</Text>
              </View>
              <View style={styles.chartArea}>
                <View style={styles.yourPortfolioLine} />
                <View style={styles.benchmarkLine} />
              </View>
            </View>
            <View style={styles.chartLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: GOLD }]} />
                <Text style={styles.legendText}>Your Portfolio</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: LIGHT_GRAY }]} />
                <Text style={styles.legendText}>Benchmark</Text>
              </View>
            </View>
          </View>

          {/* Stats Comparison Table */}
          <View style={styles.statsTable}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderCell}>Metric</Text>
              <Text style={styles.tableHeaderCell}>Your Portfolio</Text>
              <Text style={styles.tableHeaderCell}>Benchmark</Text>
            </View>

            {benchmarkStats.map((stat, idx) => renderBenchmarkStat(stat, idx))}
          </View>

          <View style={{ height: 50 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MATTE_BLACK,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomColor: DARK_GRAY,
    borderBottomWidth: 1,
    paddingHorizontal: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomColor: 'transparent',
    borderBottomWidth: 2,
  },
  activeTab: {
    borderBottomColor: GOLD,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: LIGHT_GRAY,
  },
  activeTabText: {
    color: GOLD,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  searchBarContainer: {
    paddingVertical: 12,
  },
  searchInput: {
    backgroundColor: DARK_GRAY,
    borderColor: GOLD,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: WHITE,
    fontSize: 14,
  },
  categoryContainer: {
    marginBottom: 12,
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderColor: '#262626',
    borderWidth: 1,
    marginRight: 8,
    backgroundColor: DARK_GRAY,
  },
  activeCategoryChip: {
    backgroundColor: GOLD,
    borderColor: GOLD,
  },
  categoryChipText: {
    color: LIGHT_GRAY,
    fontSize: 12,
    fontWeight: '600',
  },
  activeCategoryChipText: {
    color: MATTE_BLACK,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: LIGHT_GRAY,
    fontSize: 14,
  },
  newsList: {
    gap: 12,
    paddingTop: 8,
  },
  newsCard: {
    backgroundColor: DARK_GRAY,
    borderRadius: 8,
    padding: 12,
    borderColor: '#262626',
    borderWidth: 1,
  },
  newsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  newsTitle: {
    flex: 1,
    marginRight: 8,
  },
  newsHeading: {
    color: WHITE,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
  },
  menuButton: {
    padding: 4,
  },
  menuText: {
    color: GOLD,
    fontSize: 18,
    fontWeight: '700',
  },
  newsSummary: {
    color: LIGHT_GRAY,
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 10,
  },
  newsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sourceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  newsSource: {
    color: WHITE,
    fontSize: 10,
    fontWeight: '700',
  },
  newsTime: {
    color: LIGHT_GRAY,
    fontSize: 11,
  },
  skeletonCard: {
    backgroundColor: DARK_GRAY,
    borderRadius: 8,
    padding: 12,
    borderColor: '#262626',
    borderWidth: 1,
    marginBottom: 12,
  },
  skeletonLine: {
    height: 12,
    backgroundColor: '#2A2A2A',
    borderRadius: 4,
  },
  benchmarkHeader: {
    color: WHITE,
    fontSize: 16,
    fontWeight: '700',
    marginVertical: 12,
  },
  benchmarkSelectorContainer: {
    marginBottom: 16,
  },
  benchmarkScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  benchmarkChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderColor: '#262626',
    borderWidth: 1,
    marginRight: 8,
  },
  activeBenchmarkChip: {
    backgroundColor: GOLD,
  },
  benchmarkChipText: {
    color: LIGHT_GRAY,
    fontSize: 13,
    fontWeight: '600',
  },
  activeBenchmarkChipText: {
    color: MATTE_BLACK,
  },
  quoteCard: {
    backgroundColor: DARK_GRAY,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderColor: '#262626',
    borderWidth: 1,
  },
  quoteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  quoteName: {
    color: WHITE,
    fontSize: 16,
    fontWeight: '700',
  },
  quoteSymbol: {
    color: LIGHT_GRAY,
    fontSize: 12,
    marginTop: 2,
  },
  quotePrice: {
    alignItems: 'flex-end',
  },
  quotePriceValue: {
    color: WHITE,
    fontSize: 18,
    fontWeight: '700',
  },
  quoteChange: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  timeframeContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    justifyContent: 'space-between',
  },
  timeframeChip: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderColor: '#262626',
    borderWidth: 1,
    alignItems: 'center',
  },
  activeTimeframe: {
    backgroundColor: GOLD,
  },
  timeframeText: {
    color: LIGHT_GRAY,
    fontSize: 12,
    fontWeight: '600',
  },
  activeTimeframeText: {
    color: MATTE_BLACK,
  },
  chartContainer: {
    backgroundColor: DARK_GRAY,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderColor: '#262626',
    borderWidth: 1,
  },
  chartContent: {
    flexDirection: 'row',
    height: 200,
    marginBottom: 12,
  },
  yAxis: {
    width: 40,
    justifyContent: 'space-between',
    marginRight: 8,
  },
  chartArea: {
    flex: 1,
    borderLeftColor: LIGHT_GRAY,
    borderLeftWidth: 1,
    borderBottomColor: LIGHT_GRAY,
    borderBottomWidth: 1,
    paddingLeft: 8,
  },
  yourPortfolioLine: {
    position: 'absolute',
    bottom: '45%',
    left: 8,
    right: 0,
    height: 2,
    backgroundColor: GOLD,
    opacity: 0.8,
  },
  benchmarkLine: {
    position: 'absolute',
    bottom: '35%',
    left: 8,
    right: 0,
    height: 2,
    backgroundColor: LIGHT_GRAY,
    opacity: 0.5,
  },
  axisLabel: {
    color: LIGHT_GRAY,
    fontSize: 11,
  },
  chartLegend: {
    flexDirection: 'row',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    color: LIGHT_GRAY,
    fontSize: 12,
  },
  statsTable: {
    backgroundColor: DARK_GRAY,
    borderRadius: 8,
    overflow: 'hidden',
    borderColor: '#262626',
    borderWidth: 1,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomColor: '#262626',
    borderBottomWidth: 1,
    backgroundColor: '#0F0F0F',
  },
  tableHeaderCell: {
    flex: 1,
    color: GOLD,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  statRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomColor: '#262626',
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  statMetric: {
    flex: 1,
    color: WHITE,
    fontSize: 13,
    fontWeight: '500',
  },
  statValues: {
    flex: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statValue: {
    flex: 1,
    textAlign: 'center',
    color: LIGHT_GRAY,
    fontSize: 12,
    fontWeight: '600',
  },
});
