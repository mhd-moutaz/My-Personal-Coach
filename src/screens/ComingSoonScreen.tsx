import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Dumbbell, TrendingUp, Utensils } from 'lucide-react-native';
import { Card } from '../components/Card';
import { useCoach } from '../context/CoachContext';
import { FONTS } from '../theme/tokens';

interface ComingSoonScreenProps {
  tab: 'workouts' | 'nutrition' | 'progress';
}

export function ComingSoonScreen({ tab }: ComingSoonScreenProps) {
  const { palette, t } = useCoach();

  const accentColor =
    tab === 'workouts'
      ? palette.workout
      : tab === 'nutrition'
      ? palette.nutrition
      : palette.water;

  const softColor =
    tab === 'workouts'
      ? palette.workoutSoft
      : tab === 'nutrition'
      ? palette.nutritionSoft
      : palette.waterSoft;

  const title =
    tab === 'workouts'
      ? t('comingSoonWorkoutsTitle')
      : tab === 'nutrition'
      ? t('comingSoonNutritionTitle')
      : t('comingSoonProgressTitle');

  const desc =
    tab === 'workouts'
      ? t('comingSoonWorkoutsDesc')
      : tab === 'nutrition'
      ? t('comingSoonNutritionDesc')
      : t('comingSoonProgressDesc');

  const Icon =
    tab === 'workouts'
      ? Dumbbell
      : tab === 'nutrition'
      ? Utensils
      : TrendingUp;

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <Card style={styles.card}>
        <View style={[styles.iconWrap, { backgroundColor: softColor }]}>
          <Icon size={32} color={accentColor} />
        </View>

        <Text style={[styles.kicker, { color: accentColor }]}>
          {t('comingSoonBadge')}
        </Text>
        <Text style={[styles.title, { color: palette.text }]}>{title}</Text>
        <Text style={[styles.desc, { color: palette.textMuted }]}>{desc}</Text>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    gap: 10,
  },
  iconWrap: {
    width: 68,
    height: 68,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  kicker: {
    fontFamily: FONTS.bold,
    fontSize: 13,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    textAlign: 'center',
  },
  desc: {
    fontFamily: FONTS.regular,
    fontSize: 14.5,
    lineHeight: 22,
    textAlign: 'center',
  },
});
