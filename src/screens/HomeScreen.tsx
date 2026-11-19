import React, { useMemo } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  CheckCircle2,
  Droplets,
  Dumbbell,
  Minus,
  Moon,
  Plus,
  RotateCcw,
  Sun,
  Utensils,
} from 'lucide-react-native';
import { Button } from '../components/Button';
import { CalorieRing } from '../components/CalorieRing';
import { Card } from '../components/Card';
import { useCoach } from '../context/CoachContext';
import { getExerciseById } from '../data/exercises';
import { FONTS, RADIUS } from '../theme/tokens';
import { MealSlot } from '../types/coach';

function getGreetingKey():
  | 'greetingMorning'
  | 'greetingAfternoon'
  | 'greetingEvening' {
  const hour = new Date().getHours();
  if (hour < 12) return 'greetingMorning';
  if (hour < 17) return 'greetingAfternoon';
  return 'greetingEvening';
}

function getSlotLabelKey(slot: MealSlot) {
  switch (slot) {
    case 'breakfast':
      return 'slotBreakfast' as const;
    case 'lunch':
      return 'slotLunch' as const;
    case 'snack':
      return 'slotSnack' as const;
    case 'dinner':
      return 'slotDinner' as const;
  }
}

export function HomeScreen() {
  const {
    palette,
    isRTL,
    settings,
    profile,
    plan,
    dailyLog,
    t,
    toggleTheme,
    addWater,
    removeWater,
    toggleMealCompleted,
    undoLastMeal,
    toggleWorkoutCompleted,
  } = useCoach();
  const insets = useSafeAreaInsets();

  const consumedStats = useMemo(() => {
    if (!plan) {
      return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    }
    return plan.dailyMeals.reduce(
      (acc, meal) => {
        if (dailyLog.completedMealIds.includes(meal.id)) {
          acc.calories += meal.calories;
          acc.protein += meal.proteinG;
          acc.carbs += meal.carbsG;
          acc.fat += meal.fatG;
        }
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }, [plan, dailyLog.completedMealIds]);

  const nextMeal = useMemo(() => {
    if (!plan) return null;
    return (
      plan.dailyMeals.find(
        (m) => !dailyLog.completedMealIds.includes(m.id)
      ) ?? null
    );
  }, [plan, dailyLog.completedMealIds]);

  const todaysWorkout = useMemo(() => {
    if (!plan) return null;
    const todayIndex = new Date().getDay();
    return (
      plan.weeklySchedule.find((d) => d.dayIndex === todayIndex) ??
      plan.weeklySchedule[0]
    );
  }, [plan]);

  if (!plan || !profile) {
    return null;
  }

  const greetingText = profile.name
    ? `${t(getGreetingKey())}، ${profile.name}`
    : t(getGreetingKey());
  const greetingFormatted =
    settings.language === 'en' && profile.name
      ? `${t(getGreetingKey())}, ${profile.name}`
      : greetingText;

  const waterProgress = Math.min(
    1,
    plan.waterGoalMl > 0 ? dailyLog.waterMl / plan.waterGoalMl : 0
  );
  const waterGoalReached = dailyLog.waterMl >= plan.waterGoalMl;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: palette.background }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: Math.max(insets.top + 14, 24),
          paddingBottom: Math.max(insets.bottom + 112, 120),
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Top Greeting Bar + Theme Toggle */}
      <View
        style={[
          styles.topBar,
          { flexDirection: isRTL ? 'row-reverse' : 'row' },
        ]}
      >
        <View style={styles.greetingCol}>
          <Text
            numberOfLines={1}
            style={[
              styles.greetingTitle,
              { color: palette.text, textAlign: isRTL ? 'right' : 'left' },
            ]}
          >
            {greetingFormatted}
          </Text>
          <Text
            style={[
              styles.greetingSub,
              {
                color: palette.textMuted,
                textAlign: isRTL ? 'right' : 'left',
              },
            ]}
          >
            {t('coachSubtitle')}
          </Text>
        </View>

        <Pressable
          onPress={toggleTheme}
          style={[
            styles.themeBtn,
            {
              backgroundColor: palette.card,
              borderColor: palette.border,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel={t('themeLabel')}
        >
          {settings.theme === 'dark' ? (
            <Sun size={20} color={palette.warning} />
          ) : (
            <Moon size={20} color={palette.text} />
          )}
        </Pressable>
      </View>

      {/* Daily Calorie Ring + Remaining Macros */}
      <Card>
        <CalorieRing
          targetCalories={plan.targetCalories}
          consumedCalories={consumedStats.calories}
          proteinLeft={Math.max(0, plan.macros.proteinG - consumedStats.protein)}
          proteinTarget={plan.macros.proteinG}
          carbsLeft={Math.max(0, plan.macros.carbsG - consumedStats.carbs)}
          carbsTarget={plan.macros.carbsG}
          fatLeft={Math.max(0, plan.macros.fatG - consumedStats.fat)}
          fatTarget={plan.macros.fatG}
        />
      </Card>

      {/* Water Tracker Card */}
      <Card>
        <View
          style={[
            styles.cardHeader,
            { flexDirection: isRTL ? 'row-reverse' : 'row' },
          ]}
        >
          <View
            style={[
              styles.cardTitleGroup,
              { flexDirection: isRTL ? 'row-reverse' : 'row' },
            ]}
          >
            <View
              style={[
                styles.iconBadge,
                { backgroundColor: palette.waterSoft },
              ]}
            >
              <Droplets size={18} color={palette.water} />
            </View>
            <Text style={[styles.cardTitle, { color: palette.text }]}>
              {t('waterTrackerTitle')}
            </Text>
          </View>

          <Text style={[styles.waterNumbers, { color: palette.text }]}>
            {`${dailyLog.waterMl} / ${plan.waterGoalMl} ${t('ml')}`}
          </Text>
        </View>

        <View
          style={[
            styles.waterTrack,
            { backgroundColor: palette.cardElevated },
          ]}
        >
          <View
            style={[
              styles.waterFill,
              {
                width: `${Math.round(waterProgress * 100)}%`,
                backgroundColor: palette.water,
                alignSelf: isRTL ? 'flex-end' : 'flex-start',
              },
            ]}
          />
        </View>

        {waterGoalReached && (
          <Text
            style={[
              styles.waterGoalDone,
              {
                color: palette.nutrition,
                textAlign: isRTL ? 'right' : 'left',
              },
            ]}
          >
            {t('waterGoalReached')}
          </Text>
        )}

        <View
          style={[
            styles.waterActions,
            { flexDirection: isRTL ? 'row-reverse' : 'row' },
          ]}
        >
          <Pressable
            onPress={() => addWater(250)}
            style={({ pressed }) => [
              styles.addWaterBtn,
              {
                backgroundColor: palette.waterSoft,
                borderColor: palette.water,
                opacity: pressed ? 0.8 : 1,
                flexDirection: isRTL ? 'row-reverse' : 'row',
              },
            ]}
          >
            <Plus size={18} color={palette.water} />
            <Text style={[styles.addWaterText, { color: palette.water }]}>
              {t('waterAdd250')}
            </Text>
          </Pressable>

          {dailyLog.waterMl > 0 && (
            <Pressable
              onPress={() => removeWater(250)}
              style={[
                styles.undoWaterBtn,
                {
                  backgroundColor: palette.cardElevated,
                  borderColor: palette.border,
                },
              ]}
              accessibilityLabel="Remove 250ml"
            >
              <Minus size={18} color={palette.textMuted} />
            </Pressable>
          )}
        </View>
      </Card>

      {/* Today's Workout Card (#FF5E36) */}
      {todaysWorkout && (
        <Card>
          <View
            style={[
              styles.cardHeader,
              { flexDirection: isRTL ? 'row-reverse' : 'row' },
            ]}
          >
            <View
              style={[
                styles.cardTitleGroup,
                { flexDirection: isRTL ? 'row-reverse' : 'row' },
              ]}
            >
              <View
                style={[
                  styles.iconBadge,
                  { backgroundColor: palette.workoutSoft },
                ]}
              >
                <Dumbbell size={18} color={palette.workout} />
              </View>
              <Text style={[styles.cardTitle, { color: palette.text }]}>
                {t('todaysWorkoutTitle')}
              </Text>
            </View>

            {todaysWorkout.isRestDay ? (
              <Text style={[styles.metaInline, { color: palette.textMuted }]}>
                {t('restDayBadge')}
              </Text>
            ) : (
              <Text style={[styles.metaInline, { color: palette.workout }]}>
                {`${t('exercisesCount', {
                  count: todaysWorkout.exercises.length,
                })} · ${todaysWorkout.estimatedMinutes} ${t('min')}`}
              </Text>
            )}
          </View>

          <Text
            style={[
              styles.focusTitle,
              { color: palette.text, textAlign: isRTL ? 'right' : 'left' },
            ]}
          >
            {settings.language === 'ar'
              ? todaysWorkout.titleAr
              : todaysWorkout.titleEn}
          </Text>

          {todaysWorkout.isRestDay ? (
            <Text
              style={[
                styles.bodyMuted,
                {
                  color: palette.textMuted,
                  textAlign: isRTL ? 'right' : 'left',
                },
              ]}
            >
              {t('restDayDesc')}
            </Text>
          ) : (
            <View style={styles.workoutPreviewList}>
              {todaysWorkout.exercises.slice(0, 3).map((item) => {
                const exercise = getExerciseById(item.exerciseId);
                if (!exercise) return null;
                return (
                  <View
                    key={item.exerciseId}
                    style={[
                      styles.exerciseRow,
                      {
                        borderBottomColor: palette.border,
                        flexDirection: isRTL ? 'row-reverse' : 'row',
                      },
                    ]}
                  >
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.exerciseName,
                        {
                          color: palette.text,
                          textAlign: isRTL ? 'right' : 'left',
                        },
                      ]}
                    >
                      {settings.language === 'ar'
                        ? exercise.nameAr
                        : exercise.nameEn}
                    </Text>
                    <Text
                      style={[styles.exerciseRx, { color: palette.textMuted }]}
                    >
                      {`${item.sets} × ${item.reps}`}
                    </Text>
                  </View>
                );
              })}

              {todaysWorkout.cardioFinisherEn && (
                <Text
                  style={[
                    styles.finisherNote,
                    {
                      color: palette.workout,
                      textAlign: isRTL ? 'right' : 'left',
                    },
                  ]}
                >
                  {settings.language === 'ar'
                    ? todaysWorkout.cardioFinisherAr
                    : todaysWorkout.cardioFinisherEn}
                </Text>
              )}

              <Button
                label={
                  dailyLog.workoutCompleted
                    ? t('workoutCompleted')
                    : t('markWorkoutDone')
                }
                variant={dailyLog.workoutCompleted ? 'secondary' : 'workout'}
                onPress={toggleWorkoutCompleted}
                icon={
                  dailyLog.workoutCompleted ? (
                    <CheckCircle2 size={18} color={palette.nutrition} />
                  ) : undefined
                }
                style={{ marginTop: 8 }}
              />
            </View>
          )}
        </Card>
      )}

      {/* Next Meal Card (#00E676) with Quick Complete toggle */}
      <Card>
        <View
          style={[
            styles.cardHeader,
            { flexDirection: isRTL ? 'row-reverse' : 'row' },
          ]}
        >
          <View
            style={[
              styles.cardTitleGroup,
              { flexDirection: isRTL ? 'row-reverse' : 'row' },
            ]}
          >
            <View
              style={[
                styles.iconBadge,
                { backgroundColor: palette.nutritionSoft },
              ]}
            >
              <Utensils size={18} color={palette.nutrition} />
            </View>
            <Text style={[styles.cardTitle, { color: palette.text }]}>
              {t('nextMealTitle')}
            </Text>
          </View>

          {dailyLog.completedMealIds.length > 0 && (
            <Pressable
              onPress={undoLastMeal}
              style={[
                styles.undoMealBtn,
                { flexDirection: isRTL ? 'row-reverse' : 'row' },
              ]}
            >
              <RotateCcw size={14} color={palette.textMuted} />
              <Text style={[styles.undoMealText, { color: palette.textMuted }]}>
                {t('undoLastMeal')}
              </Text>
            </Pressable>
          )}
        </View>

        {nextMeal ? (
          <View style={styles.mealBody}>
            <Text
              style={[
                styles.slotLabel,
                {
                  color: palette.nutrition,
                  textAlign: isRTL ? 'right' : 'left',
                },
              ]}
            >
              {`${t(getSlotLabelKey(nextMeal.slot))} · ${nextMeal.calories} ${t(
                'kcal'
              )}`}
            </Text>

            <Text
              style={[
                styles.focusTitle,
                { color: palette.text, textAlign: isRTL ? 'right' : 'left' },
              ]}
            >
              {settings.language === 'ar' ? nextMeal.nameAr : nextMeal.nameEn}
            </Text>

            <Text
              style={[
                styles.bodyMuted,
                {
                  color: palette.textMuted,
                  textAlign: isRTL ? 'right' : 'left',
                },
              ]}
            >
              {settings.language === 'ar'
                ? nextMeal.descriptionAr
                : nextMeal.descriptionEn}
            </Text>

            <Text
              style={[
                styles.mealMacrosLine,
                {
                  color: palette.textSubtle,
                  textAlign: isRTL ? 'right' : 'left',
                },
              ]}
            >
              {`${t('protein')}: ${nextMeal.proteinG}${t('gram')}  ·  ${t(
                'carbs'
              )}: ${nextMeal.carbsG}${t('gram')}  ·  ${t('fat')}: ${
                nextMeal.fatG
              }${t('gram')}`}
            </Text>

            <Button
              label={t('quickCompleteMeal')}
              variant="nutrition"
              onPress={() => toggleMealCompleted(nextMeal.id)}
              icon={<CheckCircle2 size={18} color="#09150E" />}
              style={{ marginTop: 6 }}
            />
          </View>
        ) : (
          <View style={styles.mealBody}>
            <Text
              style={[
                styles.focusTitle,
                {
                  color: palette.nutrition,
                  textAlign: isRTL ? 'right' : 'left',
                },
              ]}
            >
              {t('allMealsDoneTitle')}
            </Text>
            <Text
              style={[
                styles.bodyMuted,
                {
                  color: palette.textMuted,
                  textAlign: isRTL ? 'right' : 'left',
                },
              ]}
            >
              {t('allMealsDoneDesc')}
            </Text>
          </View>
        )}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 18,
    gap: 16,
  },
  topBar: {
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  greetingCol: {
    flex: 1,
    gap: 2,
  },
  greetingTitle: {
    fontFamily: FONTS.bold,
    fontSize: 23,
    lineHeight: 31,
  },
  greetingSub: {
    fontFamily: FONTS.regular,
    fontSize: 13.5,
  },
  themeBtn: {
    width: 46,
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeader: {
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 8,
  },
  cardTitleGroup: {
    alignItems: 'center',
    gap: 10,
  },
  iconBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontFamily: FONTS.bold,
    fontSize: 16,
  },
  metaInline: {
    fontFamily: FONTS.semiBold,
    fontSize: 12.5,
    fontVariant: ['tabular-nums'],
  },
  waterNumbers: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    fontVariant: ['tabular-nums'],
  },
  waterTrack: {
    height: 10,
    borderRadius: 999,
    overflow: 'hidden',
    marginBottom: 12,
  },
  waterFill: {
    height: '100%',
    borderRadius: 999,
  },
  waterGoalDone: {
    fontFamily: FONTS.semiBold,
    fontSize: 12.5,
    marginBottom: 10,
  },
  waterActions: {
    gap: 10,
  },
  addWaterBtn: {
    flex: 1,
    minHeight: 48,
    borderRadius: RADIUS.button,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addWaterText: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    fontVariant: ['tabular-nums'],
  },
  undoWaterBtn: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.button,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  focusTitle: {
    fontFamily: FONTS.bold,
    fontSize: 17,
    marginBottom: 6,
  },
  bodyMuted: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  workoutPreviewList: {
    marginTop: 4,
    gap: 4,
  },
  exerciseRow: {
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  exerciseName: {
    flex: 1,
    fontFamily: FONTS.semiBold,
    fontSize: 14,
  },
  exerciseRx: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    fontVariant: ['tabular-nums'],
  },
  finisherNote: {
    fontFamily: FONTS.semiBold,
    fontSize: 12.5,
    marginTop: 6,
  },
  mealBody: {
    gap: 4,
  },
  slotLabel: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    fontVariant: ['tabular-nums'],
  },
  mealMacrosLine: {
    fontFamily: FONTS.semiBold,
    fontSize: 12.5,
    marginTop: 4,
    marginBottom: 4,
    fontVariant: ['tabular-nums'],
  },
  undoMealBtn: {
    minHeight: 36,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 5,
  },
  undoMealText: {
    fontFamily: FONTS.semiBold,
    fontSize: 12.5,
  },
});
