import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUserStore } from '../../store/userStore';
import { getQuotes } from '../../services/yahooFinance';
import { getMarketNews } from '../../services/newsService';

interface MarketIndex {
  symbol: string;
  name: string;
  price: number | string;
  change: number;
  changePercent: number;
  loading?: boolean;
}

interface AssetCategory {
  label: string;
  value: string;
  percent: number;
}

const INITIAL_MARKET_INDICES: MarketIndex[] = [
  { symbol: '^GSPC', name: 'S&P 500', price: '---', change: 0, changePercent: 0, loading: true },
  { symbol: '^IXIC', name: 'NASDAQ', price: '---', change: 0, changePercent: 0, loading: true },
  { symbol: '^STI', name: 'STI', price: '---', change: 0, changePercent: 0, loading: true },
  { symbol: '^FTSE', name: 'FTSE 100', price: '---', change: 0, changePercent: 0, loading: true },
];

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const { name, loadFromStorage } = useUserStore();
  const [refreshing, setRefreshing] = useState(false);
  const [marketIndices, setMarketIndices] = useState<MarketIndex[]>(INITIAL_MARKET_INDICES);
  const [newsItems, setNewsItems] = useState<any[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);

  const assetCategories: AssetCategory[] = [
    { label: 'Stocks', value: '$48,500', percent: 39 },
    { label: 'Cash', value: '$22,100', percent: 18 },
    { label: 'Property', value: '$35,200', percent: 28 },
    { label: 'Crypto', value: '$12,300', percent: 10 },
    { label: 'Bonds', value: '$6,250', percent: 5 },
  ];

  useEffect(() => {
    loadFromStorage();
    fetchMarketData();
    fetchNewsData();
  }, []);

  const fetchMarketData = async () => {
    try {
      const symbols = ['^GSPC', '^IXIC', '^STI', '^FTSE'];
      const quotes = await getQuotes(symbols);

      const updatedIndices = INITIAL_MARKET_INDICES.map((index) => {
        const quote = quotes.find((q) => q.symbol === index.symbol);
        if (quote) {
          return {
            ...index,
            price: quote.price.toFixed(2),
            change: quote.change,
            changePercent: quote.changePercent,
            loading: false,
          };
        }
        return { ...index, loading: false };
      });

      setMarketIndices(updatedIndices);
    } catch (error) {
      console.error('Error fetching market data:', error);
      // Fall back to placeholder data
      setMarketIndices(
        INITIAL_MARKET_INDICES.map((index) => ({
          ...index,
          loading: false,
        }))
      );
    }
  };

  const fetchNewsData = async () => {
    try {
      setNewsLoading(true);
      const news = await getMarketNews();
      setNewsItems(news.slice(0, 4));
    } catch (error) {
      console.error('Error fetching news:', error);
      setNewsItems([]);
    } finally {
      setNewsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchMarketData(), fetchNewsData()]);
    setRefreshing(false);
  };

  const getTimeAgoString = (publishedAt: number): string => {
    const now = Date.now();
    const diffMs = now - publishedAt;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(publishedAt).toLocaleDateString();
  };

  const getFormattedDate = (): string => {
    const now = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const dayName = days[now.getDay()];
    const monthName = months[now.getMonth()];
    const date = now.getDate();
    const year = now.getFullYear();
    return `${dayName}, ${date} ${monthName} ${year}`;
  };

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={styles.contentContainer}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#C9A84C" />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.greeting}>Good morning, {name || 'Investor'}</Text>
          <Text style={styles.date}>{getFormattedDate()}</Text>
        </View>
        <Text style={styles.notificationBell}>🔔</Text>
      </View>

      {/* Net Worth Card */}
      <View style={styles.netWorthCard}>
        <Text style={styles.netWorthLabel}>NET WORTH</Text>
        <Text style={styles.netWorthAmount}>$124,350.00</Text>
        <Text style={styles.netWorthChange}>+$2,340 (1.9%) today</Text>
      </View>

      {/* Asset Breakdown */}
      <Text style={styles.sectionTitle}>Asset Breakdown</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.assetScroll}>
        {assetCategories.map((asset, index) => (
          <View key={index} style={styles.assetCard}>
            <Text style={styles.assetLabel}>{asset.label}</Text>
            <Text style={styles.assetValue}>{asset.value}</Text>
            <Text style={styles.assetPercent}>{asset.percent}%</Text>
          </View>
        ))}
      </ScrollView>

      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <TouchableOpacity style={styles.quickActionButton}>
          <Text style={styles.quickActionText}>+ Add Asset</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickActionButton}>
          <Text style={styles.quickActionText}>Import CSV</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickActionButton}>
          <Text style={styles.quickActionText}>Set Goal</Text>
        </TouchableOpacity>
      </View>

      {/* Market Pulse */}
      <View style={styles.marketPulseContainer}>
        <Text style={styles.sectionTitle}>Market Pulse</Text>
        <View style={styles.marketGrid}>
          {marketIndices.map((index, idx) => (
            <View key={idx} style={styles.marketCard}>
              {index.loading ? (
                <ActivityIndicator color="#C9A84C" size="small" />
              ) : (
                <>
                  <Text style={styles.marketName}>{index.name}</Text>
                  <Text style={styles.marketPrice}>
                    {typeof index.price === 'number' ? `$${index.price.toFixed(2)}` : index.price}
                  </Text>
                  <Text
                    style={[
                      styles.marketChange,
                      {
                        color: index.changePercent >= 0 ? '#22C55E' : '#EF4444',
                      },
                    ]}
                  >
                    {index.changePercent >= 0 ? '+' : ''}{index.changePercent.toFixed(2)}%
                  </Text>
                </>
              )}
            </View>
          ))}
        </View>
      </View>

      {/* Recent News */}
      <View style={styles.newsContainer}>
        <View style={styles.newsHeader}>
          <Text style={styles.sectionTitle}>Today's Headlines</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllLink}>View All</Text>
          </TouchableOpacity>
        </View>

        {newsLoading ? (
          <ActivityIndicator color="#C9A84C" size="large" style={styles.newsLoading} />
        ) : newsItems.length > 0 ? (
          newsItems.map((item) => (
            <TouchableOpacity key={item.id} style={styles.newsCard}>
              <Text style={styles.newsTitle} numberOfLines={2}>
                {item.title}
              </Text>
              <View style={styles.newsFooter}>
                <Text style={styles.newsSource}>{item.source}</Text>
                <Text style={styles.newsTime}>{getTimeAgoString(item.publishedAt)}</Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.noNews}>No news available</Text>
        )}
      </View>

      {/* Bottom spacing */}
      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 16,
  },
  headerText: {
    flex: 1,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  date: {
    fontSize: 13,
    color: '#888888',
    fontWeight: '400',
  },
  notificationBell: {
    fontSize: 24,
  },

  // Net Worth Card
  netWorthCard: {
    backgroundColor: '#141414',
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
    borderBottomWidth: 2,
    borderBottomColor: '#C9A84C',
  },
  netWorthLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#C9A84C',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  netWorthAmount: {
    fontSize: 42,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  netWorthChange: {
    fontSize: 14,
    fontWeight: '600',
    color: '#22C55E',
  },

  // Asset Breakdown
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  assetScroll: {
    marginBottom: 24,
  },
  assetCard: {
    backgroundColor: '#141414',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: 140,
    borderWidth: 1,
    borderColor: '#1E1E1E',
  },
  assetLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#888888',
    marginBottom: 8,
  },
  assetValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  assetPercent: {
    fontSize: 13,
    fontWeight: '600',
    color: '#C9A84C',
  },

  // Quick Actions
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 28,
    gap: 8,
  },
  quickActionButton: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#C9A84C',
    borderRadius: 8,
    paddingVertical: 11,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#C9A84C',
    textAlign: 'center',
  },

  // Market Pulse
  marketPulseContainer: {
    marginBottom: 28,
  },
  marketGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  marketCard: {
    width: '48%',
    backgroundColor: '#141414',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1E1E1E',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  marketName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888888',
    marginBottom: 8,
  },
  marketPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  marketChange: {
    fontSize: 13,
    fontWeight: '700',
  },

  // News Section
  newsContainer: {
    marginBottom: 12,
  },
  newsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  viewAllLink: {
    fontSize: 13,
    fontWeight: '600',
    color: '#C9A84C',
  },
  newsCard: {
    backgroundColor: '#141414',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#1E1E1E',
  },
  newsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 10,
    lineHeight: 18,
  },
  newsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  newsSource: {
    fontSize: 11,
    fontWeight: '500',
    color: '#888888',
  },
  newsTime: {
    fontSize: 11,
    fontWeight: '500',
    color: '#666666',
  },
  newsLoading: {
    marginVertical: 20,
  },
  noNews: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    paddingVertical: 20,
  },
});
