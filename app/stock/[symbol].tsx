import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { getQuote, getHistory, Quote, HistoricalData } from '../../services/yahooFinance';

interface PortfolioHolding {
  symbol: string;
  shares: number;
  avgCost: number;
  type: string;
  addedAt: number;
}

export default function StockDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { symbol } = useLocalSearchParams<{ symbol: string }>();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [history, setHistory] = useState<HistoricalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1y');
  const [showAbout, setShowAbout] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [shares, setShares] = useState('');
  const [avgCost, setAvgCost] = useState('');
  const [assetType, setAssetType] = useState('Stock');

  const timeframes = [
    { label: '1D', value: '1d' },
    { label: '1W', value: '5d' },
    { label: '1M', value: '1mo' },
    { label: '6M', value: '6mo' },
    { label: '1Y', value: '1y' },
    { label: '5Y', value: '5y' },
  ];

  useEffect(() => {
    if (!symbol) {
      setError('Symbol not found');
      setLoading(false);
      return;
    }
    fetchData();
  }, [symbol]);

  useEffect(() => {
    if (symbol) {
      fetchHistory(selectedTimeframe);
    }
  }, [selectedTimeframe, symbol]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const quoteData = await getQuote(symbol as string);

      if (!quoteData) {
        setError('Stock not found');
        setQuote(null);
      } else {
        setQuote(quoteData);
      }

      const historyData = await getHistory(symbol as string, '1y', '1d');
      setHistory(historyData);
    } catch (err) {
      console.error('Error fetching stock data:', err);
      setError('Failed to load stock data');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async (range: string) => {
    try {
      const historyData = await getHistory(symbol as string, range, '1d');
      setHistory(historyData);
    } catch (err) {
      console.error('Error fetching history:', err);
    }
  };

  const downsampleData = (data: HistoricalData | null, maxPoints: number = 30) => {
    if (!data || !data.closes || data.closes.length === 0) {
      return null;
    }

    const closes = data.closes.filter((v) => v !== null && v !== undefined);
    if (closes.length === 0) return null;

    let downsampledCloses = closes;
    if (closes.length > maxPoints) {
      const step = Math.ceil(closes.length / maxPoints);
      downsampledCloses = closes.filter((_, i) => i % step === 0);
    }

    return {
      labels: downsampledCloses.map((_, i) => ''),
      datasets: [
        {
          data: downsampledCloses.map((v) => (v > 0 ? v : 0)),
          strokeWidth: 2,
        },
      ],
    };
  };

  const formatNumber = (value: number): string => {
    if (value >= 1_000_000_000) {
      return `${(value / 1_000_000_000).toFixed(1)}B`;
    }
    if (value >= 1_000_000) {
      return `${(value / 1_000_000).toFixed(1)}M`;
    }
    if (value >= 1_000) {
      return `${(value / 1_000).toFixed(1)}K`;
    }
    return value.toFixed(0);
  };

  const calculate52WHighLow = () => {
    if (!history || !history.closes) {
      return { high: 0, low: 0 };
    }
    const closes = history.closes.filter((v) => v > 0);
    if (closes.length === 0) return { high: 0, low: 0 };
    return {
      high: Math.max(...closes),
      low: Math.min(...closes),
    };
  };

  const handleAddToPortfolio = async () => {
    if (!shares || !avgCost) {
      Alert.alert('Error', 'Please enter both shares and average cost');
      return;
    }

    try {
      const sharesNum = parseFloat(shares);
      const avgCostNum = parseFloat(avgCost);

      if (isNaN(sharesNum) || isNaN(avgCostNum) || sharesNum <= 0 || avgCostNum <= 0) {
        Alert.alert('Error', 'Please enter valid numbers greater than 0');
        return;
      }

      const existingHoldings = await AsyncStorage.getItem('portfolio_holdings');
      let holdings: PortfolioHolding[] = existingHoldings
        ? JSON.parse(existingHoldings)
        : [];

      const existingIndex = holdings.findIndex((h) => h.symbol === symbol);
      if (existingIndex >= 0) {
        const existing = holdings[existingIndex];
        const totalShares = existing.shares + sharesNum;
        const newAvgCost =
          (existing.shares * existing.avgCost + sharesNum * avgCostNum) / totalShares;
        holdings[existingIndex] = {
          ...existing,
          shares: totalShares,
          avgCost: newAvgCost,
        };
      } else {
        holdings.push({
          symbol: symbol as string,
          shares: sharesNum,
          avgCost: avgCostNum,
          type: assetType,
          addedAt: Date.now(),
        });
      }

      await AsyncStorage.setItem('portfolio_holdings', JSON.stringify(holdings));
      Alert.alert('Success', 'Added to portfolio');
      setModalVisible(false);
      setShares('');
      setAvgCost('');
      setAssetType('Stock');
    } catch (error) {
      console.error('Error adding to portfolio:', error);
      Alert.alert('Error', 'Failed to add to portfolio');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#C9A84C" />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !quote) {
    return (
      <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || 'Stock not found'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const chartData = downsampleData(history);
  const priceHigh = Math.max(...(history?.closes || [0]));
  const priceLow = Math.min(...(history?.closes.filter((v) => v > 0) || [0]));
  const week52 = calculate52WHighLow();

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.symbolTitle}>{quote.symbol}</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Price Card */}
        <View style={styles.priceCard}>
          <Text style={styles.companyName}>{quote.name}</Text>
          <Text style={styles.currentPrice}>${quote.price.toFixed(2)}</Text>
          <View style={styles.changeContainer}>
            <Text
              style={[
                styles.changeText,
                { color: quote.change >= 0 ? '#22C55E' : '#EF4444' },
              ]}
            >
              {quote.change >= 0 ? '+' : ''}${quote.change.toFixed(2)}
            </Text>
            <Text
              style={[
                styles.changePercentText,
                { color: quote.change >= 0 ? '#22C55E' : '#EF4444' },
              ]}
            >
              ({quote.changePercent >= 0 ? '+' : ''}{quote.changePercent.toFixed(2)}%)
            </Text>
          </View>
          <Text style={styles.exchangeText}>
            {quote.exchange} • {quote.currency}
          </Text>
        </View>

        {/* Timeframe Selector */}
        <View style={styles.timeframeContainer}>
          {timeframes.map((tf) => (
            <TouchableOpacity
              key={tf.value}
              style={[
                styles.timeframeButton,
                selectedTimeframe === tf.value && styles.timeframeButtonActive,
              ]}
              onPress={() => setSelectedTimeframe(tf.value)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.timeframeText,
                  selectedTimeframe === tf.value && styles.timeframeTextActive,
                ]}
              >
                {tf.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Chart */}
        {chartData && chartData.datasets[0].data.length > 1 ? (
          <View style={styles.chartContainer}>
            <LineChart
              data={chartData}
              width={Dimensions.get('window').width - 32}
              height={220}
              chartConfig={{
                backgroundColor: '#0A0A0A',
                backgroundGradientFrom: '#0A0A0A',
                backgroundGradientTo: '#0A0A0A',
                color: () => '#C9A84C',
                strokeWidth: 2,
                useShadowColorFromDataset: false,
                propsForLabels: {
                  fontSize: 10,
                  fill: '#666666',
                },
                propsForVerticalLabels: {
                  fontSize: 10,
                  fill: '#666666',
                },
              }}
              bezier
            />
          </View>
        ) : (
          <View style={styles.chartPlaceholder}>
            <Text style={styles.chartPlaceholderText}>Chart data not available</Text>
          </View>
        )}

        {/* Key Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Previous Close</Text>
            <Text style={styles.statValue}>${quote.previousClose.toFixed(2)}</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Day High</Text>
            <Text style={styles.statValue}>
              ${quote.dayHigh > 0 ? quote.dayHigh.toFixed(2) : '---'}
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Day Low</Text>
            <Text style={styles.statValue}>
              ${quote.dayLow > 0 ? quote.dayLow.toFixed(2) : '---'}
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Volume</Text>
            <Text style={styles.statValue}>{formatNumber(quote.volume)}</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Market Cap</Text>
            <Text style={styles.statValue}>{formatNumber(quote.marketCap)}</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>52W High</Text>
            <Text style={styles.statValue}>${week52.high.toFixed(2)}</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>52W Low</Text>
            <Text style={styles.statValue}>${week52.low.toFixed(2)}</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>52W Range</Text>
            <Text style={styles.statValue}>
              ${week52.low.toFixed(2)} - ${week52.high.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.aboutContainer}>
          <TouchableOpacity
            style={styles.aboutHeader}
            onPress={() => setShowAbout(!showAbout)}
            activeOpacity={0.7}
          >
            <Text style={styles.aboutTitle}>About</Text>
            <Ionicons
              name={showAbout ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#C9A84C"
            />
          </TouchableOpacity>

          {showAbout && (
            <Text style={styles.aboutText}>
              Loading company information...
            </Text>
          )}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Bottom Add Button */}
      <TouchableOpacity
        style={[styles.bottomAddButton, { marginBottom: insets.bottom + 8 }]}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <Text style={styles.bottomAddButtonText}>Add to Portfolio</Text>
      </TouchableOpacity>

      {/* Add to Portfolio Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: insets.bottom + 20 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add to Portfolio</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalLabel}>Number of Shares</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter shares"
              placeholderTextColor="#666666"
              value={shares}
              onChangeText={setShares}
              keyboardType="decimal-pad"
            />

            <Text style={styles.modalLabel}>Average Cost per Share</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter average cost"
              placeholderTextColor="#666666"
              value={avgCost}
              onChangeText={setAvgCost}
              keyboardType="decimal-pad"
            />

            <Text style={styles.modalLabel}>Asset Type</Text>
            <View style={styles.assetTypeContainer}>
              {['Stock', 'ETF', 'Crypto', 'Mutual Fund'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.assetTypeButton,
                    assetType === type && styles.assetTypeButtonActive,
                  ]}
                  onPress={() => setAssetType(type)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.assetTypeText,
                      assetType === type && styles.assetTypeTextActive,
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleAddToPortfolio}
              activeOpacity={0.7}
            >
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E1E1E',
  },
  symbolTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#C9A84C',
  },
  addButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1.5,
    borderColor: '#C9A84C',
    borderRadius: 6,
  },
  addButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#C9A84C',
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  priceCard: {
    marginBottom: 20,
  },
  companyName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  currentPrice: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  changeText: {
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
  },
  changePercentText: {
    fontSize: 16,
    fontWeight: '700',
  },
  exchangeText: {
    fontSize: 12,
    color: '#888888',
  },
  timeframeContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
    justifyContent: 'space-between',
  },
  timeframeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: '#1E1E1E',
    alignItems: 'center',
  },
  timeframeButtonActive: {
    backgroundColor: '#C9A84C',
    borderColor: '#C9A84C',
  },
  timeframeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#888888',
  },
  timeframeTextActive: {
    color: '#0A0A0A',
  },
  chartContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  chartPlaceholder: {
    height: 220,
    backgroundColor: '#141414',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  chartPlaceholderText: {
    fontSize: 14,
    color: '#666666',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#141414',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1E1E1E',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#888888',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  aboutContainer: {
    backgroundColor: '#141414',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1E1E1E',
  },
  aboutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  aboutTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  aboutText: {
    fontSize: 14,
    color: '#CCCCCC',
    marginTop: 12,
    lineHeight: 20,
  },
  bottomAddButton: {
    marginHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#C9A84C',
    borderRadius: 12,
    alignItems: 'center',
  },
  bottomAddButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0A0A0A',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#141414',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#C9A84C',
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: '#0A0A0A',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1E1E1E',
  },
  assetTypeContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  assetTypeButton: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1E1E1E',
    backgroundColor: '#0A0A0A',
    alignItems: 'center',
  },
  assetTypeButtonActive: {
    backgroundColor: '#C9A84C',
    borderColor: '#C9A84C',
  },
  assetTypeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#888888',
  },
  assetTypeTextActive: {
    color: '#0A0A0A',
  },
  confirmButton: {
    backgroundColor: '#C9A84C',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0A0A0A',
  },
});
