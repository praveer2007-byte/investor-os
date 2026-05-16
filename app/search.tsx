import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { searchTicker, SearchResult } from '../services/yahooFinance';

const POPULAR_SYMBOLS = ['AAPL', 'MSFT', 'NVDA', 'TSLA', 'VOO', 'QQQ', 'SPY', 'AMZN', 'GOOGL', 'META'];

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const searchResults = await searchTicker(query);
        setResults(searchResults);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query]);

  const handleResultPress = (symbol: string) => {
    router.push(`/stock/${symbol}`);
  };

  const handlePopularPress = (symbol: string) => {
    router.push(`/stock/${symbol}`);
  };

  const renderSearchResult = ({ item }: { item: SearchResult }) => (
    <TouchableOpacity
      style={styles.resultRow}
      onPress={() => handleResultPress(item.symbol)}
      activeOpacity={0.7}
    >
      <View style={styles.resultContent}>
        <Text style={styles.resultSymbol}>{item.symbol}</Text>
        <View style={styles.resultMeta}>
          <Text style={styles.resultName}>{item.name}</Text>
          <Text style={styles.resultExchange}>{item.exchange}</Text>
        </View>
      </View>
      <Text style={styles.resultType}>{item.type}</Text>
    </TouchableOpacity>
  );

  const renderPopularChips = () => (
    <View style={styles.popularContainer}>
      <Text style={styles.popularTitle}>Popular</Text>
      <View style={styles.chipGrid}>
        {POPULAR_SYMBOLS.map((symbol) => (
          <TouchableOpacity
            key={symbol}
            style={styles.chip}
            onPress={() => handlePopularPress(symbol)}
            activeOpacity={0.7}
          >
            <Text style={styles.chipText}>{symbol}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="search" size={48} color="#C9A84C" style={styles.emptyIcon} />
      <Text style={styles.emptyText}>Search for any stock, ETF, or index worldwide</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Search Stocks</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Search Input */}
      <View style={styles.searchInputContainer}>
        <Ionicons name="search" size={20} color="#C9A84C" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search ticker or company..."
          placeholderTextColor="#666666"
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
        />
      </View>

      {/* Loading Indicator */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#C9A84C" />
        </View>
      )}

      {/* Results or Popular */}
      {!loading && (
        <FlatList
          data={results}
          renderItem={renderSearchResult}
          keyExtractor={(item) => item.symbol}
          ListEmptyComponent={query.trim() === '' ? renderPopularChips() : renderEmptyState()}
          contentContainerStyle={styles.listContent}
          scrollEnabled={results.length > 0}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 16,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderColor: '#C9A84C',
    borderRadius: 12,
    backgroundColor: '#141414',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 0,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E1E1E',
  },
  resultContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultSymbol: {
    fontSize: 16,
    fontWeight: '700',
    color: '#C9A84C',
    marginRight: 12,
    minWidth: 50,
  },
  resultMeta: {
    flex: 1,
  },
  resultName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  resultExchange: {
    fontSize: 12,
    color: '#888888',
  },
  resultType: {
    fontSize: 11,
    fontWeight: '600',
    color: '#C9A84C',
    backgroundColor: '#1E1E1E',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#888888',
    textAlign: 'center',
  },
  popularContainer: {
    paddingTop: 24,
  },
  popularTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1.5,
    borderColor: '#C9A84C',
    borderRadius: 20,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#C9A84C',
  },
});
