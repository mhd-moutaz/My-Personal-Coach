import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Globe,
  Moon,
  RefreshCw,
  Scale,
  Sparkles,
  Sun,
} from 'lucide-react-native';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { useCoach } from '../context/CoachContext';
import { FONTS, RADIUS } from '../theme/tokens';
import { formatWeight } from '../utils/units';

export function ProfileScreen() {
  const {
    palette,
    isRTL,
    settings,
    profile,
    plan,
    t,
    setLanguage,
    setThemeMode,
    setWeightUnit,
    reopenOnboarding,
  } = useCoach();
  const insets = useSafeAreaInsets();

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
      <Text
        style={[
          styles.pageTitle,
          { color: palette.text, textAlign: isRTL ? 'right' : 'left' },
        ]}
      >
        {t('profileTitle')}
      </Text>

      {/* Plan Snapshot */}
      {profile && plan && (
        <Card style={styles.snapshotCard}>
          <Text
            style={[
              styles.cardHeading,
              { color: palette.text, textAlign: isRTL ? 'right' : 'left' },
            ]}
          >
            {t('planSnapshotTitle')}
          </Text>

          <View
            style={[
              styles.metricsRow,
              { flexDirection: isRTL ? 'row-reverse' : 'row' },
            ]}
          >
            <View style={styles.metricBox}>
              <Text style={[styles.metricValue, { color: palette.text }]}>
                {formatWeight(
                  profile.weightKg,
                  settings.unit,
                  settings.language
                )}
              </Text>
              <Text style={[styles.metricLabel, { color: palette.textMuted }]}>
                {t('currentWeightShort')}
              </Text>
            </View>

            <View
              style={[styles.divider, { backgroundColor: palette.border }]}
            />

            <View style={styles.metricBox}>
              <Text style={[styles.metricValue, { color: palette.nutrition }]}>
                {formatWeight(
                  profile.targetWeightKg,
                  settings.unit,
                  settings.language
                )}
              </Text>
              <Text style={[styles.metricLabel, { color: palette.textMuted }]}>
                {t('targetWeightShort')}
              </Text>
            </View>

            <View
              style={[styles.divider, { backgroundColor: palette.border }]}
            />

            <View style={styles.metricBox}>
              <Text style={[styles.metricValue, { color: palette.workout }]}>
                {`${plan.targetCalories} ${t('kcal')}`}
              </Text>
              <Text style={[styles.metricLabel, { color: palette.textMuted }]}>
                {t('dailyTargetShort')}
              </Text>
            </View>
          </View>

          <Button
            label={t('recalculatePlanBtn')}
            variant="secondary"
            onPress={reopenOnboarding}
            icon={<RefreshCw size={17} color={palette.text} />}
          />
        </Card>
      )}

      {/* Preferences */}
      <Card style={styles.settingsCard}>
        <Text
          style={[
            styles.cardHeading,
            { color: palette.text, textAlign: isRTL ? 'right' : 'left' },
          ]}
        >
          {t('preferencesTitle')}
        </Text>

        {/* Language AR / EN */}
        <View style={styles.settingBlock}>
          <View
            style={[
              styles.settingLabelRow,
              { flexDirection: isRTL ? 'row-reverse' : 'row' },
            ]}
          >
            <Globe size={18} color={palette.workout} />
            <Text style={[styles.settingLabel, { color: palette.text }]}>
              {t('languageLabel')}
            </Text>
          </View>
          <View
            style={[
              styles.segmentRow,
              { flexDirection: isRTL ? 'row-reverse' : 'row' },
            ]}
          >
            <Pressable
              onPress={() => setLanguage('ar')}
              style={[
                styles.segmentBtn,
                {
                  backgroundColor:
                    settings.language === 'ar'
                      ? palette.workoutSoft
                      : palette.inputBg,
                  borderColor:
                    settings.language === 'ar'
                      ? palette.workout
                      : palette.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.segmentText,
                  {
                    color:
                      settings.language === 'ar'
                        ? palette.workout
                        : palette.text,
                    fontFamily:
                      settings.language === 'ar' ? FONTS.bold : FONTS.semiBold,
                  },
                ]}
              >
                {t('arabicLabel')}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setLanguage('en')}
              style={[
                styles.segmentBtn,
                {
                  backgroundColor:
                    settings.language === 'en'
                      ? palette.workoutSoft
                      : palette.inputBg,
                  borderColor:
                    settings.language === 'en'
                      ? palette.workout
                      : palette.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.segmentText,
                  {
                    color:
                      settings.language === 'en'
                        ? palette.workout
                        : palette.text,
                    fontFamily:
                      settings.language === 'en' ? FONTS.bold : FONTS.semiBold,
                  },
                ]}
              >
                {t('englishLabel')}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Theme Dark / Light */}
        <View style={styles.settingBlock}>
          <View
            style={[
              styles.settingLabelRow,
              { flexDirection: isRTL ? 'row-reverse' : 'row' },
            ]}
          >
            {settings.theme === 'dark' ? (
              <Moon size={18} color={palette.water} />
            ) : (
              <Sun size={18} color={palette.warning} />
            )}
            <Text style={[styles.settingLabel, { color: palette.text }]}>
              {t('themeLabel')}
            </Text>
          </View>
          <View
            style={[
              styles.segmentRow,
              { flexDirection: isRTL ? 'row-reverse' : 'row' },
            ]}
          >
            {(['dark', 'light'] as const).map((mode) => {
              const active = settings.theme === mode;
              return (
                <Pressable
                  key={mode}
                  onPress={() => setThemeMode(mode)}
                  style={[
                    styles.segmentBtn,
                    {
                      backgroundColor: active
                        ? palette.workoutSoft
                        : palette.inputBg,
                      borderColor: active ? palette.workout : palette.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      {
                        color: active ? palette.workout : palette.text,
                        fontFamily: active ? FONTS.bold : FONTS.semiBold,
                      },
                    ]}
                  >
                    {mode === 'dark' ? t('darkLabel') : t('lightLabel')}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Weight Units kg / lb */}
        <View style={styles.settingBlock}>
          <View
            style={[
              styles.settingLabelRow,
              { flexDirection: isRTL ? 'row-reverse' : 'row' },
            ]}
          >
            <Scale size={18} color={palette.nutrition} />
            <Text style={[styles.settingLabel, { color: palette.text }]}>
              {t('unitsLabel')}
            </Text>
          </View>
          <View
            style={[
              styles.segmentRow,
              { flexDirection: isRTL ? 'row-reverse' : 'row' },
            ]}
          >
            {(['kg', 'lb'] as const).map((u) => {
              const active = settings.unit === u;
              return (
                <Pressable
                  key={u}
                  onPress={() => setWeightUnit(u)}
                  style={[
                    styles.segmentBtn,
                    {
                      backgroundColor: active
                        ? palette.nutritionSoft
                        : palette.inputBg,
                      borderColor: active ? palette.nutrition : palette.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      {
                        color: active ? palette.nutrition : palette.text,
                        fontFamily: active ? FONTS.bold : FONTS.semiBold,
                      },
                    ]}
                  >
                    {u === 'kg' ? t('kgLabel') : t('lbLabel')}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </Card>

      {/* Future Phase AI Teaser (No AI calls or keys stored in Phase 1) */}
      <Card elevated>
        <View
          style={[
            styles.teaserHeader,
            { flexDirection: isRTL ? 'row-reverse' : 'row' },
          ]}
        >
          <Sparkles size={18} color={palette.textMuted} />
          <Text
            style={[
              styles.teaserTitle,
              { color: palette.text, textAlign: isRTL ? 'right' : 'left' },
            ]}
          >
            {t('aiSettingsTeaserTitle')}
          </Text>
        </View>
        <Text
          style={[
            styles.teaserDesc,
            { color: palette.textMuted, textAlign: isRTL ? 'right' : 'left' },
          ]}
        >
          {t('aiSettingsTeaserDesc')}
        </Text>
      </Card>

      <Text style={[styles.disclaimer, { color: palette.textSubtle }]}>
        {t('medicalDisclaimer')}
      </Text>
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
  pageTitle: {
    fontFamily: FONTS.bold,
    fontSize: 24,
    lineHeight: 32,
  },
  snapshotCard: {
    gap: 16,
  },
  cardHeading: {
    fontFamily: FONTS.bold,
    fontSize: 16,
  },
  metricsRow: {
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metricBox: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  metricValue: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    fontVariant: ['tabular-nums'],
  },
  metricLabel: {
    fontFamily: FONTS.regular,
    fontSize: 12,
  },
  divider: {
    width: 1,
    height: 38,
  },
  settingsCard: {
    gap: 18,
  },
  settingBlock: {
    gap: 10,
  },
  settingLabelRow: {
    alignItems: 'center',
    gap: 8,
  },
  settingLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: 14.5,
  },
  segmentRow: {
    gap: 10,
  },
  segmentBtn: {
    flex: 1,
    minHeight: 46,
    borderRadius: RADIUS.input,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  segmentText: {
    fontSize: 14,
  },
  teaserHeader: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  teaserTitle: {
    flex: 1,
    fontFamily: FONTS.bold,
    fontSize: 14.5,
  },
  teaserDesc: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    lineHeight: 20,
  },
  disclaimer: {
    fontFamily: FONTS.regular,
    fontSize: 12.5,
    textAlign: 'center',
    marginTop: 4,
  },
});
