import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const MATTE_BLACK = '#0A0A0A';
const GOLD = '#C9A84C';
const WHITE = '#FFFFFF';
const DARK_GRAY = '#1A1A1A';
const LIGHT_GRAY = '#999999';
const DARK_SURFACE = '#141414';

export default function GamificationScreen() {
  const insets = useSafeAreaInsets();
  const [expandedMilestone, setExpandedMilestone] = useState<string | null>(null);

  // Investor Level Data
  const levelData = {
    level: 7,
    title: 'Long-Term Thinker',
    currentXp: 2340,
    nextLevelXp: 3000,
    nextLevel: 'Level 8 — Wealth Builder',
  };

  // Active Streaks
  const streaks = [
    { id: '1', emoji: '🔥', label: '28-Day Investing Streak', count: 28 },
    { id: '2', emoji: '💰', label: '12-Week Savings', count: 12 },
    { id: '3', emoji: '📊', label: '15-Day Learning', count: 15 },
  ];

  // Milestones
  const milestones = [
    {
      id: '1',
      title: 'First Investment',
      description: 'You made your first trade',
      completed: true,
      progress: 100,
    },
    {
      id: '2',
      title: 'Diversified',
      description: 'Held 5+ different assets',
      completed: true,
      progress: 100,
    },
    {
      id: '3',
      title: '$10,000 Portfolio',
      description: 'Reached $10K net worth',
      completed: true,
      progress: 100,
    },
    {
      id: '4',
      title: '$50,000 Portfolio',
      description: 'Reach $50K net worth',
      completed: false,
      progress: 68,
    },
    {
      id: '5',
      title: '$100K Club',
      description: 'Reach $100K net worth',
      completed: false,
      progress: 34,
    },
    {
      id: '6',
      title: '100-Day Streak',
      description: 'Invest for 100 consecutive days',
      completed: false,
      progress: 28,
    },
    {
      id: '7',
      title: 'Diversification Master',
      description: 'Hold 10+ assets across 5 sectors',
      completed: false,
      progress: 40,
    },
  ];

  // Weekly Challenges
  const challenges = [
    {
      id: '1',
      title: 'Read 3 Finance Articles',
      completed: 2,
      total: 3,
    },
    {
      id: '2',
      title: 'Check Portfolio Daily',
      completed: 5,
      total: 7,
    },
    {
      id: '3',
      title: 'Add a New Holding',
      completed: 0,
      total: 1,
    },
  ];

  // XP History
  const xpHistory = [
    { id: '1', amount: 50, action: 'Portfolio check-in', date: 'Today' },
    { id: '2', amount: 100, action: 'Completed challenge', date: 'Yesterday' },
    { id: '3', amount: 25, action: 'Read article', date: '2 days ago' },
    { id: '4', amount: 75, action: 'Made a trade', date: '3 days ago' },
    { id: '5', amount: 50, action: 'Portfolio check-in', date: '4 days ago' },
  ];

  const xpProgressPercent = (levelData.currentXp / levelData.nextLevelXp) * 100;

  const renderStreakCard = (streak: typeof streaks[0]) => (
    <View key={streak.id} style={styles.streakCard}>
      <Text style={styles.streakEmoji}>{streak.emoji}</Text>
      <View style={styles.streakContent}>
        <Text style={styles.streakCount}>{streak.count}</Text>
        <Text style={styles.streakLabel}>{streak.label}</Text>
      </View>
    </View>
  );

  const renderMilestoneCard = (milestone: typeof milestones[0]) => {
    const isExpanded = expandedMilestone === milestone.id;

    return (
      <TouchableOpacity
        key={milestone.id}
        style={styles.milestoneCard}
        onPress={() =>
          setExpandedMilestone(isExpanded ? null : milestone.id)
        }
        activeOpacity={0.7}
      >
        <View style={styles.milestoneHeader}>
          <View style={styles.milestoneLeft}>
            <View style={styles.milestoneIcon}>
              {milestone.completed ? (
                <Text style={styles.checkmark}>✓</Text>
              ) : (
                <Text style={styles.lockIcon}>🔒</Text>
              )}
            </View>
            <View style={styles.milestoneInfo}>
              <Text style={styles.milestoneTitle}>{milestone.title}</Text>
              <Text style={styles.milestoneDesc}>{milestone.description}</Text>
            </View>
          </View>
          <Text style={styles.progressPercent}>
            {milestone.progress}%
          </Text>
        </View>

        {!milestone.completed && (
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                { width: `${milestone.progress}%` },
              ]}
            />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderChallengeCard = (challenge: typeof challenges[0]) => {
    const progress = (challenge.completed / challenge.total) * 100;

    return (
      <View key={challenge.id} style={styles.challengeCard}>
        <View style={styles.challengeHeader}>
          <Text style={styles.challengeTitle}>{challenge.title}</Text>
          <Text style={styles.challengeProgress}>
            {challenge.completed}/{challenge.total}
          </Text>
        </View>
        <View style={styles.challengeProgressBar}>
          <View
            style={[
              styles.challengeProgressFill,
              { width: `${progress}%` },
            ]}
          />
        </View>
      </View>
    );
  };

  const renderXpHistoryItem = (item: typeof xpHistory[0]) => (
    <View key={item.id} style={styles.xpHistoryItem}>
      <View style={styles.xpHistoryLeft}>
        <Text style={styles.xpAmount}>+{item.amount} XP</Text>
        <Text style={styles.xpAction}>{item.action}</Text>
      </View>
      <Text style={styles.xpDate}>{item.date}</Text>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {/* Level Card */}
        <View style={styles.levelCard}>
          <Text style={styles.levelNumber}>{levelData.level}</Text>
          <Text style={styles.levelTitle}>{levelData.title}</Text>

          <View style={styles.xpContainer}>
            <View style={styles.xpProgressBar}>
              <View
                style={[
                  styles.xpProgressFill,
                  { width: `${xpProgressPercent}%` },
                ]}
              />
            </View>
            <Text style={styles.xpText}>
              {levelData.currentXp.toLocaleString()} / {levelData.nextLevelXp.toLocaleString()} XP
            </Text>
          </View>

          <Text style={styles.nextLevelText}>Next: {levelData.nextLevel}</Text>
        </View>

        {/* Active Streaks */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Streaks</Text>
          <View style={styles.streaksContainer}>
            {streaks.map(renderStreakCard)}
          </View>
        </View>

        {/* Wealth Milestones */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Wealth Milestones</Text>
          <View style={styles.milestonesList}>
            {milestones.map(renderMilestoneCard)}
          </View>
        </View>

        {/* Weekly Challenges */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weekly Challenges</Text>
          <View style={styles.challengesList}>
            {challenges.map(renderChallengeCard)}
          </View>
        </View>

        {/* XP History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent XP</Text>
          <View style={styles.xpHistoryList}>
            {xpHistory.map(renderXpHistoryItem)}
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MATTE_BLACK,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  // Level Card Styles
  levelCard: {
    backgroundColor: DARK_SURFACE,
    borderRadius: 16,
    padding: 24,
    marginBottom: 28,
    borderColor: GOLD,
    borderWidth: 2,
    alignItems: 'center',
  },
  levelNumber: {
    fontSize: 56,
    fontWeight: '700',
    color: GOLD,
    marginBottom: 8,
  },
  levelTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: WHITE,
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  xpContainer: {
    width: '100%',
    marginBottom: 16,
  },
  xpProgressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#0A0A0A',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  xpProgressFill: {
    height: '100%',
    backgroundColor: GOLD,
    borderRadius: 4,
  },
  xpText: {
    fontSize: 12,
    color: LIGHT_GRAY,
    textAlign: 'center',
    fontWeight: '500',
  },
  nextLevelText: {
    fontSize: 14,
    color: GOLD,
    fontWeight: '600',
  },

  // Section Styles
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: WHITE,
    marginBottom: 12,
    letterSpacing: 0.3,
  },

  // Streaks Styles
  streaksContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  streakCard: {
    flex: 1,
    backgroundColor: DARK_GRAY,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderColor: '#262626',
    borderWidth: 1,
  },
  streakEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  streakContent: {
    alignItems: 'center',
  },
  streakCount: {
    fontSize: 18,
    fontWeight: '700',
    color: GOLD,
    marginBottom: 2,
  },
  streakLabel: {
    fontSize: 11,
    color: LIGHT_GRAY,
    textAlign: 'center',
  },

  // Milestones Styles
  milestonesList: {
    gap: 10,
  },
  milestoneCard: {
    backgroundColor: DARK_GRAY,
    borderRadius: 12,
    padding: 14,
    borderColor: '#262626',
    borderWidth: 1,
  },
  milestoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  milestoneLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  milestoneIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: DARK_SURFACE,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderColor: '#262626',
    borderWidth: 1,
  },
  checkmark: {
    fontSize: 20,
    color: '#4CAF50',
    fontWeight: '700',
  },
  lockIcon: {
    fontSize: 20,
  },
  milestoneInfo: {
    flex: 1,
  },
  milestoneTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: WHITE,
    marginBottom: 2,
  },
  milestoneDesc: {
    fontSize: 12,
    color: LIGHT_GRAY,
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: '700',
    color: GOLD,
  },
  progressBarContainer: {
    width: '100%',
    height: 6,
    backgroundColor: MATTE_BLACK,
    borderRadius: 3,
    marginTop: 10,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: GOLD,
    borderRadius: 3,
  },

  // Challenges Styles
  challengesList: {
    gap: 10,
  },
  challengeCard: {
    backgroundColor: DARK_GRAY,
    borderRadius: 12,
    padding: 14,
    borderColor: '#262626',
    borderWidth: 1,
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  challengeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: WHITE,
    flex: 1,
  },
  challengeProgress: {
    fontSize: 12,
    color: GOLD,
    fontWeight: '700',
  },
  challengeProgressBar: {
    width: '100%',
    height: 6,
    backgroundColor: MATTE_BLACK,
    borderRadius: 3,
    overflow: 'hidden',
  },
  challengeProgressFill: {
    height: '100%',
    backgroundColor: GOLD,
    borderRadius: 3,
  },

  // XP History Styles
  xpHistoryList: {
    backgroundColor: DARK_GRAY,
    borderRadius: 12,
    borderColor: '#262626',
    borderWidth: 1,
    overflow: 'hidden',
  },
  xpHistoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomColor: '#262626',
    borderBottomWidth: 1,
  },
  xpHistoryLeft: {
    flex: 1,
  },
  xpAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: GOLD,
    marginBottom: 2,
  },
  xpAction: {
    fontSize: 12,
    color: LIGHT_GRAY,
  },
  xpDate: {
    fontSize: 11,
    color: LIGHT_GRAY,
    fontWeight: '500',
  },
});
