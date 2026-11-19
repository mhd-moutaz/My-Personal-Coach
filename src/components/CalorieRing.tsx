import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useCoach } from '../context/CoachContext';
import { FONTS } from '../theme/tokens';

interface CalorieRingProps {
  targetCalories: number;
  consumedCalories: number;
  proteinLeft: number;
  proteinTarget: number;
  carbsLeft: number;
  carbsTarget: number;
  fatLeft: number;
  fatTarget: number;
}

export function CalorieRing({
  targetCalories,
  consumedCalories,
  proteinLeft,
  proteinTarget,
  carbsLeft,
  carbsTarget,
  fatLeft,
  fatTarget,
}: CalorieRingProps) {
  const { palette, isRTL, t } = useCoach();

  const size = 152;
  const strokeWidth = 13;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const caloriesLeft = Math.max(0, targetCalories - consumedCalories);
  const progress =
    targetCalories > 0
      ? Math.min(1, Math.max(0, consumedCalories / targetCalories))
      : 0;
  const strokeDashoffset = circumference * (1 - progress);

  const macroRows = [
    {
      label: t('protein'),
      left: proteinLeft,
      target: proteinTarget,
      color: palette.workout,
    },
    {
      label: t('carbs'),
      left: carbsLeft,
      target: carbsTarget,
      color: palette.nutrition,
    },
    {
      label: t('fat'),
      left: fatLeft,
      target: fatTarget,
      color: palette.water,
    },
  ];

  return (
    <View
      style={[
        styles.container,
        { flexDirection: isRTL ? 'row-reverse' : 'row' },
      ]}
    >
      <View style={styles.ringWrapper}>
        <Svg width={size} height={size}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={palette.border}
            strokeWidth={strokeWidth}
            fill="none"
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={palette.nutrition}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>
        <View style={styles.ringCenter}>
          <Text
            style={[
              styles.caloriesNumber,
              { color: palette.text },
            ]}
          >
            {caloriesLeft}
          </Text>
          <Text style={[styles.caloriesSub, { color: palette.textMuted }]}>
            {t('kcal')}
          </Text>
          <Text style={[styles.caloriesTag, { color: palette.textSubtle }]}>
            {t('caloriesLeftLabel')}
          </Text>
        </View>
      </View>

      <View style={styles.macrosCol}>
        <Text
          style={[
            styles.macrosHeading,
            {
              color: palette.textMuted,
              textAlign: isRTL ? 'right' : 'left',
            },
          ]}
        >
          {t('macrosLeftTitle')}
        </Text>

        {macroRows.map((row) => {
          const remainingRatio =
            row.target > 0 ? Math.min(1, Math.max(0, row.left / row.target)) : 0;
          return (
            <View key={row.label} style={styles.macroRow}>
              <View
                style={[
                  styles.macroLabelRow,
                  { flexDirection: isRTL ? 'row-reverse' : 'row' },
                ]}
              >
                <Text style={[styles.macroLabel, { color: palette.text }]}>
                  {row.label}
                </Text>
                <Text style={[styles.macroValue, { color: palette.textMuted }]}>
                  {row.left} {t('gram')}
                </Text>
              </View>
              <View
                style={[
                  styles.barTrack,
                  { backgroundColor: palette.cardElevated },
                ]}
              >
                <View
                  style={[
                    styles.barFill,
                    {
                      width: `${Math.round(remainingRatio * 100)}%`,
                      backgroundColor: row.color,
                      alignSelf: isRTL ? 'flex-end' : 'flex-start',
                    },
                  ]}
                />
              </View>
            </View>
          );
        })}

        <Text
          style={[
            styles.consumedNote,
            {
              color: palette.textSubtle,
              textAlign: isRTL ? 'right' : 'left',
            },
          ]}
        >
          {t('caloriesConsumedOf', {
            consumed: consumedCalories,
            total: targetCalories,
          })}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 18,
  },
  ringWrapper: {
    width: 152,
    height: 152,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  caloriesNumber: {
    fontFamily: FONTS.bold,
    fontSize: 30,
    lineHeight: 36,
    fontVariant: ['tabular-nums'],
  },
  caloriesSub: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    marginTop: -2,
  },
  caloriesTag: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    marginTop: 2,
  },
  macrosCol: {
    flex: 1,
    gap: 10,
  },
  macrosHeading: {
    fontFamily: FONTS.semiBold,
    fontSize: 13,
  },
  macroRow: {
    gap: 4,
  },
  macroLabelRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  macroLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: 13,
  },
  macroValue: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    fontVariant: ['tabular-nums'],
  },
  barTrack: {
    height: 7,
    borderRadius: 999,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 999,
  },
  consumedNote: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    marginTop: 2,
    fontVariant: ['tabular-nums'],
  },
});
