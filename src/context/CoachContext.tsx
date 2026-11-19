import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { TRANSLATIONS, TranslationKey, translate } from '../i18n/translations';
import {
  clearAllCoachData,
  createEmptyDailyLog,
  DEFAULT_SETTINGS,
  loadAppState,
  saveDailyLog,
  saveProfileAndPlan,
  saveSettings,
} from '../storage/coachStorage';
import { getPalette, ThemePalette } from '../theme/tokens';
import {
  AppSettings,
  DailyLog,
  GeneratedPlan,
  Language,
  ThemeMode,
  UserProfile,
  WeightUnit,
} from '../types/coach';
import { generatePersonalPlan } from '../utils/fitness';
import { getTodayDateKey } from '../utils/units';

interface CoachContextValue {
  isReady: boolean;
  settings: AppSettings;
  palette: ThemePalette;
  isRTL: boolean;
  profile: UserProfile | null;
  plan: GeneratedPlan | null;
  dailyLog: DailyLog;
  isReeditingOnboarding: boolean;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  daysShort: readonly string[];
  completeOnboarding: (rawProfile: UserProfile) => Promise<void>;
  reopenOnboarding: () => void;
  cancelRecalculation: () => void;
  setLanguage: (language: Language) => Promise<void>;
  setThemeMode: (theme: ThemeMode) => Promise<void>;
  toggleTheme: () => Promise<void>;
  setWeightUnit: (unit: WeightUnit) => Promise<void>;
  addWater: (amountMl?: number) => Promise<void>;
  removeWater: (amountMl?: number) => Promise<void>;
  toggleMealCompleted: (mealId: string) => Promise<void>;
  undoLastMeal: () => Promise<void>;
  toggleWorkoutCompleted: () => Promise<void>;
  resetAllData: () => Promise<void>;
}

const CoachContext = createContext<CoachContextValue | null>(null);

export function CoachProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [plan, setPlan] = useState<GeneratedPlan | null>(null);
  const [dailyLog, setDailyLog] = useState<DailyLog>(() => createEmptyDailyLog());
  const [isReeditingOnboarding, setIsReeditingOnboarding] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const loaded = await loadAppState();
      if (!mounted) return;

      setSettings(loaded.settings);
      setProfile(loaded.profile);
      setPlan(loaded.plan);
      setDailyLog(loaded.dailyLog);
      setIsReady(true);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const ensureCurrentDayLog = useCallback((current: DailyLog): DailyLog => {
    const todayKey = getTodayDateKey();
    if (current.dateKey !== todayKey) {
      return createEmptyDailyLog(todayKey);
    }
    return current;
  }, []);

  const completeOnboarding = useCallback(async (rawProfile: UserProfile) => {
    const { sanitizedProfile, plan: generatedPlan } = generatePersonalPlan(rawProfile);
    const nextSettings: AppSettings = {
      ...settings,
      onboardingCompleted: true,
    };
    const freshLog = createEmptyDailyLog();

    setProfile(sanitizedProfile);
    setPlan(generatedPlan);
    setSettings(nextSettings);
    setDailyLog(freshLog);
    setIsReeditingOnboarding(false);

    await Promise.all([
      saveProfileAndPlan(sanitizedProfile, generatedPlan),
      saveSettings(nextSettings),
      saveDailyLog(freshLog),
    ]);
  }, [settings]);

  const reopenOnboarding = useCallback(() => {
    setIsReeditingOnboarding(true);
  }, []);

  const cancelRecalculation = useCallback(() => {
    setIsReeditingOnboarding(false);
  }, []);

  const setLanguage = useCallback(async (language: Language) => {
    const next: AppSettings = { ...settings, language };
    setSettings(next);
    await saveSettings(next);
  }, [settings]);

  const setThemeMode = useCallback(async (theme: ThemeMode) => {
    const next: AppSettings = { ...settings, theme };
    setSettings(next);
    await saveSettings(next);
  }, [settings]);

  const toggleTheme = useCallback(async () => {
    const nextTheme: ThemeMode = settings.theme === 'dark' ? 'light' : 'dark';
    await setThemeMode(nextTheme);
  }, [settings.theme, setThemeMode]);

  const setWeightUnit = useCallback(async (unit: WeightUnit) => {
    const next: AppSettings = { ...settings, unit };
    setSettings(next);
    await saveSettings(next);
  }, [settings]);

  const addWater = useCallback(async (amountMl: number = 250) => {
    const activeLog = ensureCurrentDayLog(dailyLog);
    const nextLog: DailyLog = {
      ...activeLog,
      waterMl: activeLog.waterMl + amountMl,
    };
    setDailyLog(nextLog);
    await saveDailyLog(nextLog);
  }, [dailyLog, ensureCurrentDayLog]);

  const removeWater = useCallback(async (amountMl: number = 250) => {
    const activeLog = ensureCurrentDayLog(dailyLog);
    const nextLog: DailyLog = {
      ...activeLog,
      waterMl: Math.max(0, activeLog.waterMl - amountMl),
    };
    setDailyLog(nextLog);
    await saveDailyLog(nextLog);
  }, [dailyLog, ensureCurrentDayLog]);

  const toggleMealCompleted = useCallback(async (mealId: string) => {
    const activeLog = ensureCurrentDayLog(dailyLog);
    const exists = activeLog.completedMealIds.includes(mealId);
    const nextCompleted = exists
      ? activeLog.completedMealIds.filter((id) => id !== mealId)
      : [...activeLog.completedMealIds, mealId];
    const nextLog: DailyLog = {
      ...activeLog,
      completedMealIds: nextCompleted,
    };
    setDailyLog(nextLog);
    await saveDailyLog(nextLog);
  }, [dailyLog, ensureCurrentDayLog]);

  const undoLastMeal = useCallback(async () => {
    const activeLog = ensureCurrentDayLog(dailyLog);
    if (activeLog.completedMealIds.length === 0) return;
    const nextLog: DailyLog = {
      ...activeLog,
      completedMealIds: activeLog.completedMealIds.slice(0, -1),
    };
    setDailyLog(nextLog);
    await saveDailyLog(nextLog);
  }, [dailyLog, ensureCurrentDayLog]);

  const toggleWorkoutCompleted = useCallback(async () => {
    const activeLog = ensureCurrentDayLog(dailyLog);
    const nextLog: DailyLog = {
      ...activeLog,
      workoutCompleted: !activeLog.workoutCompleted,
    };
    setDailyLog(nextLog);
    await saveDailyLog(nextLog);
  }, [dailyLog, ensureCurrentDayLog]);

  const resetAllData = useCallback(async () => {
    await clearAllCoachData();
    setSettings(DEFAULT_SETTINGS);
    setProfile(null);
    setPlan(null);
    setDailyLog(createEmptyDailyLog());
    setIsReeditingOnboarding(false);
  }, []);

  const palette = useMemo(() => getPalette(settings.theme), [settings.theme]);
  // Native RTL is disabled in index.ts; isRTL drives manual directional styles.
  const isRTL = settings.language === 'ar';

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>) =>
      translate(settings.language, key, params),
    [settings.language]
  );

  const daysShort = TRANSLATIONS[settings.language].daysShort;

  const value = useMemo<CoachContextValue>(
    () => ({
      isReady,
      settings,
      palette,
      isRTL,
      profile,
      plan,
      dailyLog,
      isReeditingOnboarding,
      t,
      daysShort,
      completeOnboarding,
      reopenOnboarding,
      cancelRecalculation,
      setLanguage,
      setThemeMode,
      toggleTheme,
      setWeightUnit,
      addWater,
      removeWater,
      toggleMealCompleted,
      undoLastMeal,
      toggleWorkoutCompleted,
      resetAllData,
    }),
    [
      isReady,
      settings,
      palette,
      isRTL,
      profile,
      plan,
      dailyLog,
      isReeditingOnboarding,
      t,
      daysShort,
      completeOnboarding,
      reopenOnboarding,
      cancelRecalculation,
      setLanguage,
      setThemeMode,
      toggleTheme,
      setWeightUnit,
      addWater,
      removeWater,
      toggleMealCompleted,
      undoLastMeal,
      toggleWorkoutCompleted,
      resetAllData,
    ]
  );

  return <CoachContext.Provider value={value}>{children}</CoachContext.Provider>;
}

export function useCoach(): CoachContextValue {
  const ctx = useContext(CoachContext);
  if (!ctx) {
    throw new Error('useCoach must be used inside CoachProvider');
  }
  return ctx;
}
