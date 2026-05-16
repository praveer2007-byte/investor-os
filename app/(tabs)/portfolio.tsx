import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MATTE_BLACK = '#0A0A0A';
const GOLD = '#C9A84C';
const WHITE = '#FFFFFF';
const DARK_GRAY = '#1A1A1A';
const LIGHT_GRAY = '#999999';

interface Holding {
  id: string;
  symbol: string;
  company: string;
  shares: number;
  avgCost: number;
  currentPrice: number;
  assetType: 'Stock' | 'ETF' | 'Bond' | 'Cash' | 'Other';
  currency: string;
}

interface AllocationData {
  type: 'Stocks' | 'ETFs' | 'Cash' | 'Bonds' | 'Other';
  percentage: number;
  value: number;
}

const STORAGE_KEY = 'portfolio_holdings';

export default function PortfolioScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'holdings' | 'allocation' | 'performance'>('holdings');
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1M');

  // Modal state
  const [symbolInput, setSymbolInput] = useState('');
  const [sharesInput, setSharesInput] = useState('');
  const [avgCostInput, setAvgCostInput] = useState('');
  const [currencyInput, setCurrencyInput] = useState('USD');
  const [assetTypeInput, setAssetTypeInput] = useState<'Stock' | 'ETF' | 'Bond' | 'Cash' | 'Other'>('Stock');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Load holdings on mount
  useEffect(() => {
    loadHoldings();
  }, []);

  const loadHoldings = async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        setHoldings(JSON.parse(data));
      } else {
        // Default holdings
        const defaultHoldings: Holding[] = [
          {
            id: '1',
            symbol: 'AAPL',
            company: 'Apple Inc.',
            shares: 50,
            avgCost: 145.32,
            currentPrice: 189.45,
            assetType: 'Stock',
            currency: 'USD',
          },
          {
            id: '2',
            symbol: 'VOO',
            company: 'Vanguard S&P 500 ETF',
            shares: 100,
            avgCost: 412.50,
            currentPrice: 478.92,
            assetType: 'ETF',
            currency: 'USD',
          },
          {
            id: '3',
            symbol: 'BND',
            company: 'Vanguard Total Bond Market',
            shares: 200,
            avgCost: 78.25,
            currentPrice: 81.45,
            assetType: 'Bond',
            currency: 'USD',
          },
          {
            id: '4',
            symbol: 'MSFT',
            company: 'Microsoft Corporation',
            shares: 30,
            avgCost: 310.50,
            currentPrice: 425.67,
            assetType: 'Stock',
            currency: 'USD',
          },
        ];
        setHoldings(defaultHoldings);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(defaultHoldings));
      }
    } catch (error) {
      console.error('Error loading holdings:', error);
    }
  };

  const saveHolding = async (holding: Holding) => {
    try {
      const newHoldings = [...holdings, { ...holding, id: Date.now().toString() }];
      setHoldings(newHoldings);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newHoldings));
    } catch (error) {
      console.error('Error saving holding:', error);
    }
  };

  const calculateTotalValue = (): number => {
    return holdings.reduce((sum, h) => sum + h.shares * h.currentPrice, 0);
  };

  const calculateTotalCost = (): number => {
    return holdings.reduce((sum, h) => sum + h.shares * h.avgCost, 0);
  };

  const calculatePLPercent = (): number => {
    const totalValue = calculateTotalValue();
    const totalCost = calculateTotalCost();
    if (totalCost === 0) return 0;
    return ((totalValue - totalCost) / totalCost) * 100;
  };

  const calculatePLDollar = (): number => {
    return calculateTotalValue() - calculateTotalCost();
  };

  const getAllocationData = (): AllocationData[] => {
    const allocation: Record<string, { value: number }> = {
      Stocks: { value: 0 },
      ETFs: { value: 0 },
      Bonds: { value: 0 },
      Cash: { value: 0 },
      Other: { value: 0 },
    };

    holdings.forEach((h) => {
      const type = h.assetType === 'Stock' ? 'Stocks' : h.assetType === 'ETF' ? 'ETFs' : h.assetType === 'Bond' ? 'Bonds' : h.assetType === 'Cash' ? 'Cash' : 'Other';
      allocation[type].value += h.shares * h.currentPrice;
    });

    const totalValue = calculateTotalValue();
    return Object.entries(allocation).map(([type, data]) => ({
      type: type as any,
      value: data.value,
      percentage: totalValue > 0 ? (data.value / totalValue) * 100 : 0,
    }));
  };

  const handleAddHolding = () => {
    if (!symbolInput.trim() || !sharesInput || !avgCostInput) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const searchResult = searchResults.find((r) => r.symbol === symbolInput.toUpperCase());
    const company = searchResult?.company || symbolInput.toUpperCase();

    const newHolding: Holding = {
      id: Date.now().toString(),
      symbol: symbolInput.toUpperCase(),
      company: company,
      shares: parseFloat(sharesInput),
      avgCost: parseFloat(avgCostInput),
      currentPrice: parseFloat(avgCostInput) * (1 + Math.random() * 0.3 - 0.1),
      assetType: assetTypeInput,
      currency: currencyInput,
    };

    saveHolding(newHolding);
    resetModal();
  };

  const resetModal = () => {
    setSymbolInput('');
    setSharesInput('');
    setAvgCostInput('');
    setCurrencyInput('USD');
    setAssetTypeInput('Stock');
    setSearchResults([]);
    setIsModalVisible(false);
  };

  const handleSymbolSearch = (text: string) => {
    setSymbolInput(text.toUpperCase());
    if (text.length >= 1) {
      setIsSearching(true);
      // Simulate Yahoo Finance search
      setTimeout(() => {
        const mockResults = [
          { symbol: 'AAPL', company: 'Apple Inc.' },
          { symbol: 'AMAT', company: 'Applied Materials Inc.' },
          { symbol: 'AMZN', company: 'Amazon.com Inc.' },
          { symbol: 'MSFT', company: 'Microsoft Corporation' },
          { symbol: 'NVDA', company: 'NVIDIA Corporation' },
        ].filter((r) => r.symbol.startsWith(text.toUpperCase()));
        setSearchResults(mockResults);
        setIsSearching(false);
      }, 300);
    } else {
      setSearchResults([]);
    }
  };

  const renderHoldingRow = (holding: Holding) => {
    const currentValue = holding.shares * holding.currentPrice;
    const totalCost = holding.shares * holding.avgCost;
    const plDollar = currentValue - totalCost;
    const plPercent = (plDollar / totalCost) * 100;
    const isPositive = plDollar >= 0;

    return (
      <View key={holding.id} style={styles.holdingRow}>
        <View style={styles.holdingLeft}>
          <Text style={styles.symbol}>{holding.symbol}</Text>
          <Text style={styles.company}>{holding.company}</Text>
          <Text style={styles.shares}>{holding.shares.toFixed(2)} shares @ ${holding.avgCost.toFixed(2)}</Text>
        </View>
        <View style={styles.holdingRight}>
          <Text style={styles.currentValue}>${currentValue.toFixed(2)}</Text>
          <Text style={[styles.pl, { color: isPositive ? '#4CAF50' : '#FF6B6B' }]}>
            {isPositive ? '+' : ''} ${plDollar.toFixed(2)} ({isPositive ? '+' : ''} {plPercent.toFixed(2)}%)
          </Text>
        </View>
      </View>
    );
  };

  const allocationData = getAllocationData();

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'holdings' && styles.activeTab]}
          onPress={() => setActiveTab('holdings')}
        >
          <Text style={[styles.tabText, activeTab === 'holdings' && styles.activeTabText]}>Holdings</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'allocation' && styles.activeTab]}
          onPress={() => setActiveTab('allocation')}
        >
          <Text style={[styles.tabText, activeTab === 'allocation' && styles.activeTabText]}>Allocation</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'performance' && styles.activeTab]}
          onPress={() => setActiveTab('performance')}
        >
          <Text style={[styles.tabText, activeTab === 'performance' && styles.activeTabText]}>Performance</Text>
        </TouchableOpacity>
      </View>

      {/* Holdings Tab */}
      {activeTab === 'holdings' && (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Total Portfolio Value Card */}
          <View style={styles.headerCard}>
            <Text style={styles.headerLabel}>Total Portfolio Value</Text>
            <Text style={styles.headerValue}>${calculateTotalValue().toFixed(2)}</Text>
            <View style={styles.plRow}>
              <Text style={[styles.plText, { color: calculatePLDollar() >= 0 ? '#4CAF50' : '#FF6B6B' }]}>
                {calculatePLDollar() >= 0 ? '+' : ''} ${calculatePLDollar().toFixed(2)}
              </Text>
              <Text style={[styles.plPercent, { color: calculatePLDollar() >= 0 ? '#4CAF50' : '#FF6B6B' }]}>
                ({calculatePLDollar() >= 0 ? '+' : ''} {calculatePLPercent().toFixed(2)}%)
              </Text>
            </View>
          </View>

          {/* Holdings List */}
          <View style={styles.holdingsList}>
            {holdings.map((holding) => renderHoldingRow(holding))}
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      )}

      {/* Allocation Tab */}
      {activeTab === 'allocation' && (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Pie Chart Placeholder */}
          <View style={styles.chartPlaceholder}>
            <View style={styles.chartLegend}>
              {allocationData.map((item, idx) => (
                <View key={idx} style={styles.chartBlock}>
                  <View
                    style={[
                      styles.colorIndicator,
                      {
                        backgroundColor: [GOLD, '#FF6B6B', '#4CAF50', '#2196F3', '#9C27B0'][idx % 5],
                      },
                    ]}
                  />
                </View>
              ))}
            </View>
            <Text style={styles.placeholderText}>Allocation Chart</Text>
          </View>

          {/* Breakdown List */}
          <View style={styles.breakdownList}>
            {allocationData.map((item, idx) => (
              <View key={idx} style={styles.breakdownItem}>
                <View style={styles.breakdownHeader}>
                  <Text style={styles.breakdownLabel}>{item.type}</Text>
                  <Text style={styles.breakdownPercent}>{item.percentage.toFixed(1)}%</Text>
                </View>
                <View style={styles.barContainer}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        width: `${item.percentage}%`,
                        backgroundColor: [GOLD, '#FF6B6B', '#4CAF50', '#2196F3', '#9C27B0'][idx % 5],
                      },
                    ]}
                  />
                </View>
                <Text style={styles.breakdownValue}>${item.value.toFixed(2)}</Text>
              </View>
            ))}
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      )}

      {/* Performance Tab */}
      {activeTab === 'performance' && (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Timeframe Selector */}
          <View style={styles.timeframeContainer}>
            {['1D', '1W', '1M', '6M', 'YTD', '1Y', '5Y', 'Max'].map((tf) => (
              <TouchableOpacity
                key={tf}
                style={[styles.timeframeChip, selectedTimeframe === tf && styles.activeTimeframe]}
                onPress={() => setSelectedTimeframe(tf)}
              >
                <Text style={[styles.timeframeText, selectedTimeframe === tf && styles.activeTimeframeText]}>
                  {tf}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Chart Placeholder */}
          <View style={styles.chartContainer}>
            <View style={styles.chartContent}>
              <View style={styles.yAxis}>
                <Text style={styles.axisLabel}>${(calculateTotalValue() * 1.2).toFixed(0)}</Text>
                <Text style={styles.axisLabel}>${(calculateTotalValue() * 0.9).toFixed(0)}</Text>
              </View>
              <View style={styles.chartLine} />
            </View>
            <View style={styles.xAxis}>
              <Text style={styles.axisLabel}>Start</Text>
              <Text style={styles.axisLabel}>End</Text>
            </View>
          </View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Total Return</Text>
              <Text style={[styles.statValue, { color: '#4CAF50' }]}>+{calculatePLPercent().toFixed(2)}%</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Annualized Return</Text>
              <Text style={[styles.statValue, { color: '#4CAF50' }]}>+{(calculatePLPercent() * 0.3).toFixed(2)}%</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Best Day</Text>
              <Text style={[styles.statValue, { color: '#4CAF50' }]}>+$2,847.35</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Worst Day</Text>
              <Text style={[styles.statValue, { color: '#FF6B6B' }]}>-$1,532.19</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Volatility</Text>
              <Text style={styles.statValue}>--</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Sharpe Ratio</Text>
              <Text style={styles.statValue}>1.42</Text>
            </View>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      )}

      {/* Add Holding FAB */}
      {activeTab === 'holdings' && (
        <TouchableOpacity style={styles.fab} onPress={() => setIsModalVisible(true)}>
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      )}

      {/* Add Holding Modal */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => resetModal()}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Holding</Text>
              <TouchableOpacity onPress={() => resetModal()}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Symbol Search */}
            <View style={styles.modalSection}>
              <Text style={styles.inputLabel}>Symbol</Text>
              <View style={styles.searchContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Search symbol..."
                  placeholderTextColor={LIGHT_GRAY}
                  value={symbolInput}
                  onChangeText={handleSymbolSearch}
                />
                {isSearching && <ActivityIndicator color={GOLD} />}
              </View>
              {searchResults.length > 0 && (
                <View style={styles.searchResults}>
                  {searchResults.map((result, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={styles.searchResultItem}
                      onPress={() => setSymbolInput(result.symbol)}
                    >
                      <Text style={styles.searchResultSymbol}>{result.symbol}</Text>
                      <Text style={styles.searchResultCompany}>{result.company}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Shares Input */}
            <View style={styles.modalSection}>
              <Text style={styles.inputLabel}>Shares Owned</Text>
              <TextInput
                style={styles.textInput}
                placeholder="0.00"
                placeholderTextColor={LIGHT_GRAY}
                value={sharesInput}
                onChangeText={setSharesInput}
                keyboardType="decimal-pad"
              />
            </View>

            {/* Average Cost Input */}
            <View style={styles.modalSection}>
              <Text style={styles.inputLabel}>Average Cost per Share</Text>
              <TextInput
                style={styles.textInput}
                placeholder="0.00"
                placeholderTextColor={LIGHT_GRAY}
                value={avgCostInput}
                onChangeText={setAvgCostInput}
                keyboardType="decimal-pad"
              />
            </View>

            {/* Currency Selector */}
            <View style={styles.modalSection}>
              <Text style={styles.inputLabel}>Currency</Text>
              <View style={styles.selectorRow}>
                {['USD', 'EUR', 'GBP', 'SGD'].map((curr) => (
                  <TouchableOpacity
                    key={curr}
                    style={[styles.selectorChip, currencyInput === curr && styles.activeSelector]}
                    onPress={() => setCurrencyInput(curr)}
                  >
                    <Text
                      style={[
                        styles.selectorText,
                        currencyInput === curr && styles.activeSelectorText,
                      ]}
                    >
                      {curr}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Asset Type Selector */}
            <View style={styles.modalSection}>
              <Text style={styles.inputLabel}>Asset Type</Text>
              <View style={styles.selectorRow}>
                {['Stock', 'ETF', 'Bond', 'Cash', 'Other'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.selectorChip,
                      assetTypeInput === type && styles.activeSelector,
                    ]}
                    onPress={() => setAssetTypeInput(type as any)}
                  >
                    <Text
                      style={[
                        styles.selectorText,
                        assetTypeInput === type && styles.activeSelectorText,
                      ]}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Add Button */}
            <TouchableOpacity style={styles.addButton} onPress={handleAddHolding}>
              <Text style={styles.addButtonText}>Add to Portfolio</Text>
            </TouchableOpacity>

            <View style={{ height: 50 }} />
          </View>
        </View>
      </Modal>
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
    paddingTop: 16,
  },
  headerCard: {
    backgroundColor: DARK_GRAY,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderColor: GOLD,
    borderWidth: 1,
  },
  headerLabel: {
    color: LIGHT_GRAY,
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  headerValue: {
    color: WHITE,
    fontSize: 36,
    fontWeight: '700',
    marginBottom: 12,
  },
  plRow: {
    flexDirection: 'row',
    gap: 8,
  },
  plText: {
    fontSize: 16,
    fontWeight: '600',
  },
  plPercent: {
    fontSize: 16,
    fontWeight: '600',
  },
  holdingsList: {
    gap: 12,
  },
  holdingRow: {
    backgroundColor: DARK_GRAY,
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderColor: '#262626',
    borderWidth: 1,
  },
  holdingLeft: {
    flex: 1,
  },
  holdingRight: {
    alignItems: 'flex-end',
  },
  symbol: {
    color: WHITE,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  company: {
    color: LIGHT_GRAY,
    fontSize: 12,
    marginBottom: 4,
  },
  shares: {
    color: LIGHT_GRAY,
    fontSize: 11,
  },
  currentValue: {
    color: WHITE,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  pl: {
    fontSize: 13,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: GOLD,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  fabText: {
    color: MATTE_BLACK,
    fontSize: 32,
    fontWeight: '700',
  },
  chartPlaceholder: {
    backgroundColor: DARK_GRAY,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    height: 250,
    borderColor: '#262626',
    borderWidth: 1,
  },
  chartLegend: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  chartBlock: {
    width: 40,
    height: 40,
    borderRadius: 6,
  },
  colorIndicator: {
    flex: 1,
    borderRadius: 6,
  },
  placeholderText: {
    color: LIGHT_GRAY,
    fontSize: 14,
    marginTop: 8,
  },
  breakdownList: {
    gap: 12,
  },
  breakdownItem: {
    backgroundColor: DARK_GRAY,
    borderRadius: 8,
    padding: 12,
    borderColor: '#262626',
    borderWidth: 1,
  },
  breakdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  breakdownLabel: {
    color: WHITE,
    fontSize: 14,
    fontWeight: '600',
  },
  breakdownPercent: {
    color: GOLD,
    fontSize: 14,
    fontWeight: '700',
  },
  barContainer: {
    height: 6,
    backgroundColor: '#1A1A1A',
    borderRadius: 3,
    marginBottom: 8,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  breakdownValue: {
    color: LIGHT_GRAY,
    fontSize: 12,
  },
  timeframeContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
    justifyContent: 'space-between',
  },
  timeframeChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderColor: '#262626',
    borderWidth: 1,
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
    padding: 20,
    marginBottom: 20,
    height: 200,
    borderColor: '#262626',
    borderWidth: 1,
  },
  chartContent: {
    flex: 1,
    flexDirection: 'row',
  },
  yAxis: {
    width: 50,
    justifyContent: 'space-between',
    marginRight: 10,
  },
  chartLine: {
    flex: 1,
    borderBottomColor: LIGHT_GRAY,
    borderBottomWidth: 1,
    marginBottom: 10,
  },
  xAxis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  axisLabel: {
    color: LIGHT_GRAY,
    fontSize: 11,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: DARK_GRAY,
    borderRadius: 8,
    padding: 12,
    borderColor: '#262626',
    borderWidth: 1,
  },
  statLabel: {
    color: LIGHT_GRAY,
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 8,
  },
  statValue: {
    color: WHITE,
    fontSize: 16,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: MATTE_BLACK,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingHorizontal: 16,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    color: WHITE,
    fontSize: 18,
    fontWeight: '700',
  },
  closeButton: {
    color: LIGHT_GRAY,
    fontSize: 24,
    fontWeight: '600',
  },
  modalSection: {
    marginBottom: 18,
  },
  inputLabel: {
    color: WHITE,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    backgroundColor: DARK_GRAY,
    borderColor: GOLD,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: WHITE,
    fontSize: 14,
  },
  searchResults: {
    backgroundColor: DARK_GRAY,
    borderRadius: 8,
    marginTop: 8,
    overflow: 'hidden',
  },
  searchResultItem: {
    padding: 12,
    borderBottomColor: '#262626',
    borderBottomWidth: 1,
  },
  searchResultSymbol: {
    color: GOLD,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  searchResultCompany: {
    color: LIGHT_GRAY,
    fontSize: 12,
  },
  selectorRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  selectorChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderColor: '#262626',
    borderWidth: 1,
  },
  activeSelector: {
    backgroundColor: GOLD,
  },
  selectorText: {
    color: LIGHT_GRAY,
    fontSize: 13,
    fontWeight: '600',
  },
  activeSelectorText: {
    color: MATTE_BLACK,
  },
  addButton: {
    backgroundColor: GOLD,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  addButtonText: {
    color: MATTE_BLACK,
    fontSize: 16,
    fontWeight: '700',
  },
});
