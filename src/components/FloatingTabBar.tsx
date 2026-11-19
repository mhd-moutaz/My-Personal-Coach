import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Dumbbell,
  Home,
  TrendingUp,
  User,
  Utensils,
} from 'lucide-react-native';
import { useCoach } from '../context/CoachContext';
import { FONTS, RADIUS } from '../theme/tokens';
import { TabKey } from '../types/coach';

interface FloatingTabBarProps {
  activeTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
}

export function FloatingTabBar({ activeTab, onSelectTab }: FloatingTabBarProps) {
  const { palette, isRTL, t } = useCoach();
  const insets = useSafeAreaInsets();

  const items: {
    key: TabKey;
    label: string;
    activeColor: string;
    renderIcon: (color: string) => React.ReactNode;
  }[] = [
    {
      key: 'home',
      label: t('tabHome'),
      activeColor: palette.workout,
      renderIcon: (color) => <Home size={20} color={color} strokeWidth={2.2} />,
    },
    {
      key: 'workouts',
      label: t('tabWorkouts'),
      activeColor: palette.workout,
      renderIcon: (color) => (
        <Dumbbell size={20} color={color} strokeWidth={2.2} />
      ),
    },
    {
      key: 'nutrition',
      label: t('tabNutrition'),
      activeColor: palette.nutrition,
      renderIcon: (color) => (
        <Utensils size={20} color={color} strokeWidth={2.2} />
      ),
    },
    {
      key: 'progress',
      label: t('tabProgress'),
      activeColor: palette.water,
      renderIcon: (color) => (
        <TrendingUp size={20} color={color} strokeWidth={2.2} />
      ),
    },
    {
      key: 'profile',
      label: t('tabProfile'),
      activeColor: palette.workout,
      renderIcon: (color) => <User size={20} color={color} strokeWidth={2.2} />,
    },
  ];

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.wrapper,
        { bottom: Math.max(12, insets.bottom + 8) },
      ]}
    >
      <View
        style={[
          styles.bar,
          {
            backgroundColor: palette.tabBarBg,
            borderColor: palette.tabBarBorder,
            flexDirection: isRTL ? 'row-reverse' : 'row',
            shadowColor: '#000000',
          },
        ]}
      >
        {items.map((item) => {
          const isActive = activeTab === item.key;
          const color = isActive ? item.activeColor : palette.textMuted;

          return (
            <Pressable
              key={item.key}
              onPress={() => onSelectTab(item.key)}
              style={({ pressed }) => [
                styles.tabItem,
                {
                  opacity: pressed ? 0.75 : 1,
                },
              ]}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={item.label}
            >
              <View
                style={[
                  styles.iconBadge,
                  isActive && {
                    backgroundColor:
                      item.activeColor === palette.nutrition
                        ? palette.nutritionSoft
                        : item.activeColor === palette.water
                        ? palette.waterSoft
                        : palette.workoutSoft,
                  },
                ]}
              >
                {item.renderIcon(color)}
              </View>
              <Text
                numberOfLines={1}
                style={[
                  styles.tabLabel,
                  {
                    color,
                    fontFamily: isActive ? FONTS.bold : FONTS.regular,
                  },
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 50,
  },
  bar: {
    borderRadius: RADIUS.card + 6,
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
    elevation: 10,
  },
  tabItem: {
    flex: 1,
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  iconBadge: {
    width: 38,
    height: 28,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 10.5,
  },
});
