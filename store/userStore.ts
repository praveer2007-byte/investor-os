import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserStoreState {
  hasCompletedOnboarding: boolean;
  name: string;
  investingStyle: 'growth' | 'dividend' | 'value' | 'passive' | 'mixed' | '';
  riskTolerance: 'conservative' | 'moderate' | 'aggressive' | '';
  goals: string[];
  experience: 'beginner' | 'intermediate' | 'advanced' | '';
  aiPersonality: string;
  tier: 'free' | 'plus' | 'pro';
  isLoading: boolean;
}

interface UserStoreActions {
  setOnboardingComplete: (v: boolean) => Promise<void>;
  updateProfile: (updates: Partial<UserStoreState>) => Promise<void>;
  loadFromStorage: () => Promise<void>;
  saveToStorage: () => Promise<void>;
  reset: () => Promise<void>;
}

type UserStore = UserStoreState & UserStoreActions;

const STORAGE_KEY = '@investoros_user';

const DEFAULT_STATE: UserStoreState = {
  hasCompletedOnboarding: false,
  name: '',
  investingStyle: '',
  riskTolerance: '',
  goals: [],
  experience: '',
  aiPersonality: '',
  tier: 'free',
  isLoading: false,
};

export const useUserStore = create<UserStore>((set, get) => ({
  ...DEFAULT_STATE,

  setOnboardingComplete: async (v: boolean) => {
    set({ hasCompletedOnboarding: v });
    await get().saveToStorage();
  },

  updateProfile: async (updates: Partial<UserStoreState>) => {
    // Filter out isLoading from updates to avoid updating that field
    const { isLoading, ...safeUpdates } = updates;

    set((state) => ({
      ...state,
      ...safeUpdates,
    }));

    await get().saveToStorage();
  },

  loadFromStorage: async () => {
    try {
      set({ isLoading: true });
      const stored = await AsyncStorage.getItem(STORAGE_KEY);

      if (stored) {
        const data = JSON.parse(stored);
        set({
          hasCompletedOnboarding: data.hasCompletedOnboarding || false,
          name: data.name || '',
          investingStyle: data.investingStyle || '',
          riskTolerance: data.riskTolerance || '',
          goals: data.goals || [],
          experience: data.experience || '',
          aiPersonality: data.aiPersonality || '',
          tier: data.tier || 'free',
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Failed to load user profile from storage:', error);
      set({ isLoading: false });
    }
  },

  saveToStorage: async () => {
    try {
      const state = get();
      const data = {
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        name: state.name,
        investingStyle: state.investingStyle,
        riskTolerance: state.riskTolerance,
        goals: state.goals,
        experience: state.experience,
        aiPersonality: state.aiPersonality,
        tier: state.tier,
      };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save user profile to storage:', error);
    }
  },

  reset: async () => {
    set({ ...DEFAULT_STATE, isLoading: false });
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to reset user profile:', error);
    }
  },
}));
