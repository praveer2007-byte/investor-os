import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Holding {
  id: string;
  symbol: string;
  name: string;
  shares: number;
  avgCostBasis: number;
  currency: string;
  assetType: 'stock' | 'etf' | 'crypto' | 'cash' | 'property' | 'bond' | 'other';
  addedAt: number;
}

export interface ManualAsset {
  id: string;
  name: string;
  value: number;
  currency: string;
  category: 'property' | 'cash' | 'savings' | 'vehicle' | 'other';
  addedAt: number;
}

export interface Liability {
  id: string;
  name: string;
  amount: number;
  currency: string;
  category: 'mortgage' | 'loan' | 'credit_card' | 'student_loan' | 'other';
  addedAt: number;
}

interface PortfolioStoreState {
  holdings: Holding[];
  manualAssets: ManualAsset[];
  liabilities: Liability[];
  baseCurrency: string;
  isLoading: boolean;
}

interface PortfolioStoreActions {
  addHolding: (h: Omit<Holding, 'id' | 'addedAt'>) => Promise<void>;
  updateHolding: (id: string, updates: Partial<Holding>) => Promise<void>;
  removeHolding: (id: string) => Promise<void>;
  addManualAsset: (a: Omit<ManualAsset, 'id' | 'addedAt'>) => Promise<void>;
  removeManualAsset: (id: string) => Promise<void>;
  addLiability: (l: Omit<Liability, 'id' | 'addedAt'>) => Promise<void>;
  removeLiability: (id: string) => Promise<void>;
  setBaseCurrency: (c: string) => Promise<void>;
  loadFromStorage: () => Promise<void>;
  saveToStorage: () => Promise<void>;
}

type PortfolioStore = PortfolioStoreState & PortfolioStoreActions;

const STORAGE_KEY = '@investoros_portfolio';

const generateId = (): string => {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
};

export const usePortfolioStore = create<PortfolioStore>((set, get) => ({
  holdings: [],
  manualAssets: [],
  liabilities: [],
  baseCurrency: 'USD',
  isLoading: false,

  addHolding: async (h: Omit<Holding, 'id' | 'addedAt'>) => {
    const holding: Holding = {
      ...h,
      id: generateId(),
      addedAt: Date.now(),
    };

    set((state) => ({
      holdings: [...state.holdings, holding],
    }));

    await get().saveToStorage();
  },

  updateHolding: async (id: string, updates: Partial<Holding>) => {
    set((state) => ({
      holdings: state.holdings.map((h) =>
        h.id === id ? { ...h, ...updates } : h
      ),
    }));

    await get().saveToStorage();
  },

  removeHolding: async (id: string) => {
    set((state) => ({
      holdings: state.holdings.filter((h) => h.id !== id),
    }));

    await get().saveToStorage();
  },

  addManualAsset: async (a: Omit<ManualAsset, 'id' | 'addedAt'>) => {
    const asset: ManualAsset = {
      ...a,
      id: generateId(),
      addedAt: Date.now(),
    };

    set((state) => ({
      manualAssets: [...state.manualAssets, asset],
    }));

    await get().saveToStorage();
  },

  removeManualAsset: async (id: string) => {
    set((state) => ({
      manualAssets: state.manualAssets.filter((a) => a.id !== id),
    }));

    await get().saveToStorage();
  },

  addLiability: async (l: Omit<Liability, 'id' | 'addedAt'>) => {
    const liability: Liability = {
      ...l,
      id: generateId(),
      addedAt: Date.now(),
    };

    set((state) => ({
      liabilities: [...state.liabilities, liability],
    }));

    await get().saveToStorage();
  },

  removeLiability: async (id: string) => {
    set((state) => ({
      liabilities: state.liabilities.filter((l) => l.id !== id),
    }));

    await get().saveToStorage();
  },

  setBaseCurrency: async (c: string) => {
    set({ baseCurrency: c });
    await get().saveToStorage();
  },

  loadFromStorage: async () => {
    try {
      set({ isLoading: true });
      const stored = await AsyncStorage.getItem(STORAGE_KEY);

      if (stored) {
        const data = JSON.parse(stored);
        set({
          holdings: data.holdings || [],
          manualAssets: data.manualAssets || [],
          liabilities: data.liabilities || [],
          baseCurrency: data.baseCurrency || 'USD',
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Failed to load portfolio from storage:', error);
      set({ isLoading: false });
    }
  },

  saveToStorage: async () => {
    try {
      const state = get();
      const data = {
        holdings: state.holdings,
        manualAssets: state.manualAssets,
        liabilities: state.liabilities,
        baseCurrency: state.baseCurrency,
      };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save portfolio to storage:', error);
    }
  },
}));
