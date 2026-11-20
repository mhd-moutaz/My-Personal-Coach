import React, { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Eye,
  EyeOff,
  Globe,
  Moon,
  RefreshCw,
  Scale,
  Sparkles,
  Sun,
  Trash2,
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
    hasGeminiKey,
    t,
    setLanguage,
    setThemeMode,
    setWeightUnit,
    saveGeminiKey,
    removeGeminiKey,
    setGeminiModel,
    reopenOnboarding,
  } = useCoach();
  const insets = useSafeAreaInsets();

  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [modelInput, setModelInput] = useState(settings.geminiModel);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [isSavingAi, setIsSavingAi] = useState(false);

  useEffect(() => {
    setModelInput(settings.geminiModel);
  }, [settings.geminiModel]);

  const handleSaveAiSettings = async () => {
    if (isSavingAi) return;
    setIsSavingAi(true);
    setAiFeedback(null);
    try {
      await setGeminiModel(modelInput);
      const trimmedKey = apiKeyInput.trim();
      if (trimmedKey) {
        await saveGeminiKey(trimmedKey);
        setApiKeyInput('');
        setShowApiKey(false);
        setAiFeedback(t('aiKeySavedMsg'));
      }
    } finally {
      setIsSavingAi(false);
    }
  };

  const handleDeleteKey = async () => {
    if (isSavingAi) return;
    setIsSavingAi(true);
    setAiFeedback(null);
    try {
      await removeGeminiKey();
      setApiKeyInput('');
      setShowApiKey(false);
      setAiFeedback(t('aiKeyDeletedMsg'));
    } finally {
      setIsSavingAi(false);
    }
  };

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

      {/* AI Settings */}
      <Card style={styles.settingsCard}>
        <View
          style={[
            styles.aiHeaderRow,
            { flexDirection: isRTL ? 'row-reverse' : 'row' },
          ]}
        >
          <View
            style={[
              styles.settingLabelRow,
              { flexDirection: isRTL ? 'row-reverse' : 'row', flex: 1 },
            ]}
          >
            <Sparkles size={18} color={palette.water} />
            <Text style={[styles.cardHeading, { color: palette.text }]}>
              {t('aiSettingsTitle')}
            </Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: hasGeminiKey
                  ? palette.nutritionSoft
                  : palette.cardElevated,
                borderColor: hasGeminiKey ? palette.nutrition : palette.border,
              },
            ]}
          >
            <Text
              style={[
                styles.statusBadgeText,
                { color: hasGeminiKey ? palette.nutrition : palette.textMuted },
              ]}
            >
              {hasGeminiKey ? t('aiKeySavedBadge') : t('aiKeyNotSavedBadge')}
            </Text>
          </View>
        </View>

        <View style={styles.settingBlock}>
          <Text
            style={[
              styles.settingLabel,
              { color: palette.text, textAlign: isRTL ? 'right' : 'left' },
            ]}
          >
            {t('aiApiKeyLabel')}
          </Text>

          <View
            style={[
              styles.inputRow,
              { flexDirection: isRTL ? 'row-reverse' : 'row' },
            ]}
          >
            <TextInput
              value={apiKeyInput}
              onChangeText={setApiKeyInput}
              placeholder={
                hasGeminiKey ? '••••••••••••••••••••' : t('aiApiKeyPlaceholder')
              }
              placeholderTextColor={palette.textSubtle}
              secureTextEntry={!showApiKey}
              autoCapitalize="none"
              autoCorrect={false}
              style={[
                styles.textInput,
                {
                  flex: 1,
                  backgroundColor: palette.inputBg,
                  borderColor: palette.border,
                  color: palette.text,
                  textAlign: isRTL ? 'right' : 'left',
                },
              ]}
            />
            <Pressable
              onPress={() => setShowApiKey((prev) => !prev)}
              style={[
                styles.toggleShowBtn,
                {
                  backgroundColor: palette.inputBg,
                  borderColor: palette.border,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel={showApiKey ? t('aiHideKey') : t('aiShowKey')}
            >
              {showApiKey ? (
                <EyeOff size={18} color={palette.textMuted} />
              ) : (
                <Eye size={18} color={palette.textMuted} />
              )}
            </Pressable>
          </View>
        </View>

        <View style={styles.settingBlock}>
          <Text
            style={[
              styles.settingLabel,
              { color: palette.text, textAlign: isRTL ? 'right' : 'left' },
            ]}
          >
            {t('aiModelLabel')}
          </Text>
          <TextInput
            value={modelInput}
            onChangeText={setModelInput}
            onBlur={() => {
              void setGeminiModel(modelInput);
            }}
            placeholder={t('aiModelPlaceholder')}
            placeholderTextColor={palette.textSubtle}
            autoCapitalize="none"
            autoCorrect={false}
            style={[
              styles.textInput,
              {
                backgroundColor: palette.inputBg,
                borderColor: palette.border,
                color: palette.text,
                textAlign: isRTL ? 'right' : 'left',
              },
            ]}
          />
        </View>

        <View
          style={[
            styles.aiBtnRow,
            { flexDirection: isRTL ? 'row-reverse' : 'row' },
          ]}
        >
          <Button
            label={t('aiSaveBtn')}
            variant="workout"
            onPress={() => {
              void handleSaveAiSettings();
            }}
            disabled={isSavingAi}
            style={styles.aiSaveBtn}
          />
          {hasGeminiKey && (
            <Pressable
              onPress={() => {
                void handleDeleteKey();
              }}
              disabled={isSavingAi}
              style={({ pressed }) => [
                styles.deleteKeyBtn,
                {
                  backgroundColor: palette.dangerSoft,
                  borderColor: palette.danger,
                  opacity: isSavingAi ? 0.5 : pressed ? 0.8 : 1,
                  flexDirection: isRTL ? 'row-reverse' : 'row',
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel={t('aiDeleteBtn')}
            >
              <Trash2 size={16} color={palette.danger} />
              <Text style={[styles.deleteKeyText, { color: palette.danger }]}>
                {t('aiDeleteBtn')}
              </Text>
            </Pressable>
          )}
        </View>

        {aiFeedback && (
          <Text
            style={[
              styles.aiFeedbackText,
              {
                color: palette.nutrition,
                textAlign: isRTL ? 'right' : 'left',
              },
            ]}
          >
            {aiFeedback}
          </Text>
        )}

        <Text
          style={[
            styles.teaserDesc,
            { color: palette.textMuted, textAlign: isRTL ? 'right' : 'left' },
          ]}
        >
          {t('aiPrivacyNote')}
        </Text>

        <Text
          style={[
            styles.aiHintLink,
            { color: palette.water, textAlign: isRTL ? 'right' : 'left' },
          ]}
        >
          {t('aiGetKeyHint')}
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
  aiHeaderRow: {
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontFamily: FONTS.bold,
    fontSize: 11.5,
  },
  inputRow: {
    alignItems: 'center',
    gap: 8,
  },
  textInput: {
    minHeight: 48,
    borderRadius: RADIUS.input,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontFamily: FONTS.regular,
    fontSize: 14,
  },
  toggleShowBtn: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.input,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiBtnRow: {
    alignItems: 'center',
    gap: 10,
  },
  aiSaveBtn: {
    flex: 1,
    minHeight: 48,
  },
  deleteKeyBtn: {
    minHeight: 48,
    paddingHorizontal: 14,
    borderRadius: RADIUS.button,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  deleteKeyText: {
    fontFamily: FONTS.bold,
    fontSize: 13.5,
  },
  aiFeedbackText: {
    fontFamily: FONTS.semiBold,
    fontSize: 13,
  },
  teaserDesc: {
    fontFamily: FONTS.regular,
    fontSize: 12.5,
    lineHeight: 19,
  },
  aiHintLink: {
    fontFamily: FONTS.semiBold,
    fontSize: 12.5,
  },
  disclaimer: {
    fontFamily: FONTS.regular,
    fontSize: 12.5,
    textAlign: 'center',
    marginTop: 4,
  },
});
