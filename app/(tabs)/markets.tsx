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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const MATTE_BLACK = '#0A0A0A';
const GOLD = '#C9A84C';
const WHITE = '#FFFFFF';
const DARK_GRAY = '#1A1A1A';
const LIGHT_GRAY = '#999999';

interface NewsItem {
  id: string;
  title: string;
  source: string;
  time: string;
  summary: string;
}

interface BenchmarkStats {
  metric: string;
  yourPortfolio: string;
  benchmark: string;
  outperforming: boolean;
}

export default function MarketsScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'news' | 'benchmarks'>('news');
  const [searchInput, setSearchInput] = useState('');
  const [newsItems, setNewsItems] = useState<NewsItem[]>([
    {
      id: '1',
      title: 'Fed signals potential rate cuts ahead',
      source: 'Reuters',
      time: '2h ago',
      summary: 'Federal Reserve officials suggest interest rate cuts may be on the horizon as inflation continues to cool...',
    },
    {
      id: '2',
      title: 'Tech stocks rally on AI optimism',
      source: 'Bloomberg',
      time: '4h ago',
      summary: 'Major technology companies gained following announcements of new AI capabilities and strong earnings...',
    },
    {
      id: '3',
      title: 'Oil prices steady amid supply concerns',
      source: 'CNBC',
      time: '6h ago',
      summary: 'Crude oil prices remain stable as the market assesses geopolitical tensions and OPEC production decisions...',
    },
  ]);
  const [selectedBenchmark, setSelectedBenchmark] = useState('S&P 500');
  const [selectedTimeframe, setSelectedTimeframe] = useState('1M');
  const [isLoadingNews, setIsLoadingNews] = useState(false);

  const benchmarks = ['S&P 500', 'NASDAQ', 'STI', 'DJIA', 'FTSE 100', 'Nikkei'];
  const timeframes = ['1M', '6M', 'YTD', '1Y', '5Y'];

  const benchmarkStats: BenchmarkStats[] = [
    { metric: 'Total Return', yourPortfolio: '+12.4%', benchmark: '+8.2%', outperforming: true },
    { metric: 'Annualized', yourPortfolio: '+11.2%', benchmark: '+7.8%', outperforming: true },
    { metric: 'Best Month', yourPortfolio: '+8.3%', benchmark: '+5.1%', outperforming: true },
    { metric: 'Worst Month', yourPortfolio: '-4.2%', benchmark: '-6.8%', outperforming: true },
    { metric: 'Volatility', yourPortfolio: '14.2%', benchmark: '12.8%', outperforming: false },
    { metric: 'Sharpe Ratio', yourPortfolio: '1.24', benchmark: '0.89', outperforming: true },
  ];

  const handleSearchNews = (text: string) => {
    setSearchInput(text);
    if (text.length > 0) {
      setIsLoadingNews(true);
      // Simulate API call
      setTimeout(() => {
        const filtered = [
          {
            id: '1',
            title: 'Fed signals potential rate cuts ahead',
            source: 'Reuters',
            time: '2h ago',
            summary: 'Federal Reserve officials suggest interest rate cuts may be on the horizon as inflation continues to cool...',
          },
          {
            id: '2',
            title: 'Tech stocks rally on AI optimism',
            source: 'Bloomberg',
            time: '4h ago',
            summary: 'Major technology companies gained following announcements of new AI capabilities and strong earnings...',
          },
        ].filter(
          (item) =>
            item.title.toLowerCase().includes(text.toLowerCase()) ||
            item.source.toLowerCase().includes(text.toLowerCase())
        );
        setNewsItems(filtered);
        setIsLoadingNews(false);
      }, 500);
    } else {
      setNewsItems([
        {
          id: '1',
          title: 'Fed signals potential rate cuts ahead',
          source: 'Reuters',
          time: '2h ago',
          summary: 'Federal Reserve officials suggest interest rate cuts may be on the horizon as inflation continues to cool...',
        },
        {
          id: '2',
          title: 'Tech stocks rally on AI optimism',
          source: 'Bloomberg',
          time: '4h ago',
          summary: 'Major technology companies gained following announcements of new AI capabilities and strong earnings...',
        },
        {
          id: '3',
          title: 'Oil prices steady amid supply concerns',
          source: 'CNBC',
          time: '6h ago',
          summary: 'Crude oil prices remain stable as the market assesses geopolitical tensions and OPEC production decisions...',
        },
      ]);
    }
  };

  const renderNewsCard = (item: NewsItem) => (
    <View key={item.id} style={styles.newsCard}>
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
        <Text style={styles.newsSource}>{item.source}</Text>
        <Text style={styles.newsTime}>{item.time}</Text>
      </View>
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

          {/* News List */}
          {isLoadingNews ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color={GOLD} />
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.newsList}>
                {newsItems.map((item) => renderNewsCard(item))}
              </View>
              <View style={{ height: 50 }} />
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
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  newsSource: {
    color: GOLD,
    fontSize: 11,
    fontWeight: '600',
  },
  newsTime: {
    color: LIGHT_GRAY,
    fontSize: 11,
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
