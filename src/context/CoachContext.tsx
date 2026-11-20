import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { TRANSLATIONS, TranslationKey, translate } from '../i18n/translations';
import { callGemini } from '../services/gemini';
import {
  clearAiProgram as clearStoredAiProgram,
  clearAllCoachData,
  createEmptyDailyLog,
  DEFAULT_SETTINGS,
  loadAppState,
  saveAiProgram,
  saveDailyLog,
  saveProfileAndPlan,
  saveSettings,
} from '../storage/coachStorage';
import { deleteGeminiKey, getGeminiKey, setGeminiKey } from '../storage/secureKey';
import { getPalette, ThemePalette } from '../theme/tokens';
import {
  AiGenerateResult,
  AiWorkoutProgram,
  AppSettings,
  DailyLog,
  GeneratedPlan,
  Language,
  ThemeMode,
  UserProfile,
  WeightUnit,
  WorkoutDayPlan,
} from '../types/coach';
import {
  buildCatalogForAi,
  buildPrompt,
  getActiveDayIndices,
  validateAiDays,
} from '../utils/aiProgram';
import { generatePersonalPlan } from '../utils/fitness';
import { getTodayDateKey } from '../utils/units';

interface CoachContextValue {
  isReady: boolean;
  settings: AppSettings;
  palette: ThemePalette;
  isRTL: boolean;
  profile: UserProfile | null;
  plan: GeneratedPlan | null;
  aiProgram: AiWorkoutProgram | null;
  activeSchedule: WorkoutDayPlan[];
  hasGeminiKey: boolean;
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
  saveGeminiKey: (key: string) => Promise<void>;
  removeGeminiKey: () => Promise<void>;
  setGeminiModel: (model: string) => Promise<void>;
  generateAiProgram: (userNotes: string) => Promise<AiGenerateResult>;
  clearAiProgram: () => Promise<void>;
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
  const [aiProgram, setAiProgram] = useState<AiWorkoutProgram | null>(null);
  const [hasGeminiKey, setHasGeminiKey] = useState(false);
  const [dailyLog, setDailyLog] = useState<DailyLog>(() => createEmptyDailyLog());
  const [isReeditingOnboarding, setIsReeditingOnboarding] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const [loaded, existingKey] = await Promise.all([
        loadAppState(),
        getGeminiKey(),
      ]);
      if (!mounted) return;

      setSettings(loaded.settings);
      setProfile(loaded.profile);
      setPlan(loaded.plan);
      setAiProgram(loaded.aiProgram);
      setHasGeminiKey(Boolean(existingKey));
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
    setAiProgram(null);
    setSettings(nextSettings);
    setDailyLog(freshLog);
    setIsReeditingOnboarding(false);

    // Clear any saved AI program because profile settings (days/place/level) changed
    await Promise.all([
      saveProfileAndPlan(sanitizedProfile, generatedPlan),
      saveSettings(nextSettings),
      saveDailyLog(freshLog),
      clearStoredAiProgram(),
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

  const saveGeminiKeyAction = useCallback(async (key: string) => {
    const cleaned = key.trim();
    if (!cleaned) return;
    await setGeminiKey(cleaned);
    setHasGeminiKey(true);
  }, []);

  const removeGeminiKeyAction = useCallback(async () => {
    await deleteGeminiKey();
    setHasGeminiKey(false);
  }, []);

  const setGeminiModelAction = useCallback(async (model: string) => {
    const cleaned = model.trim() || DEFAULT_SETTINGS.geminiModel;
    const next: AppSettings = { ...settings, geminiModel: cleaned };
    setSettings(next);
    await saveSettings(next);
  }, [settings]);

  const clearAiProgramAction = useCallback(async () => {
    await clearStoredAiProgram();
    setAiProgram(null);
  }, []);

  const generateAiProgramAction = useCallback(
    async (userNotes: string): Promise<AiGenerateResult> => {
      try {
        if (!profile || !plan) {
          return { ok: false, reason: 'invalid_response' };
        }

        const apiKey = await getGeminiKey();
        if (!apiKey) {
          setHasGeminiKey(false);
          return { ok: false, reason: 'no_key' };
        }

        const model =
          settings.geminiModel.trim() || DEFAULT_SETTINGS.geminiModel;
        const cleanNotes = userNotes.trim().slice(0, 300);
        const activeDays = getActiveDayIndices(profile.trainingDays);
        const catalog = buildCatalogForAi(profile.place, profile.level);
        const { systemInstruction, userPayload } = buildPrompt(
          profile,
          cleanNotes,
          activeDays,
          catalog
        );

        const firstCall = await callGemini({
          apiKey,
          model,
          systemInstruction,
          userText: userPayload,
        });

        if (!firstCall.ok) {
          return { ok: false, reason: firstCall.reason };
        }

        const firstValidation = validateAiDays(firstCall.data, {
          activeDays,
          place: profile.place,
          level: profile.level,
        });

        let finalValidation = firstValidation;

        if (!firstValidation.ok) {
          const retryPayload = `${userPayload}\n\nYour previous JSON failed validation with these errors. Fix ALL of them and return ONLY valid JSON:\n- ${firstValidation.errors.join(
            '\n- '
          )}`;

          const retryCall = await callGemini({
            apiKey,
            model,
            systemInstruction,
            userText: retryPayload,
          });

          if (!retryCall.ok) {
            return { ok: false, reason: retryCall.reason };
          }

          finalValidation = validateAiDays(retryCall.data, {
            activeDays,
            place: profile.place,
            level: profile.level,
          });
        }

        if (!finalValidation.ok) {
          return { ok: false, reason: 'invalid_response' };
        }

        const nextProgram: AiWorkoutProgram = {
          version: 1,
          source: 'ai',
          createdAt: new Date().toISOString(),
          model,
          userNotes: cleanNotes,
          ...(finalValidation.safetyNote
            ? { safetyNote: finalValidation.safetyNote }
            : {}),
          days: finalValidation.days,
        };

        await saveAiProgram(nextProgram);
        setAiProgram(nextProgram);
        return { ok: true };
      } catch {
        return { ok: false, reason: 'network' };
      }
    },
    [profile, plan, settings.geminiModel]
  );

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
    await Promise.all([clearAllCoachData(), deleteGeminiKey()]);
    setSettings(DEFAULT_SETTINGS);
    setProfile(null);
    setPlan(null);
    setAiProgram(null);
    setHasGeminiKey(false);
    setDailyLog(createEmptyDailyLog());
    setIsReeditingOnboarding(false);
  }, []);

  const palette = useMemo(() => getPalette(settings.theme), [settings.theme]);
  // Native RTL is disabled in index.ts; isRTL drives manual directional styles.
  const isRTL = settings.language === 'ar';

  const activeSchedule = useMemo<WorkoutDayPlan[]>(() => {
    if (aiProgram?.days && aiProgram.days.length === 7) {
      return aiProgram.days;
    }
    return plan?.weeklySchedule ?? [];
  }, [aiProgram, plan]);

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
      aiProgram,
      activeSchedule,
      hasGeminiKey,
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
      saveGeminiKey: saveGeminiKeyAction,
      removeGeminiKey: removeGeminiKeyAction,
      setGeminiModel: setGeminiModelAction,
      generateAiProgram: generateAiProgramAction,
      clearAiProgram: clearAiProgramAction,
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
      aiProgram,
      activeSchedule,
      hasGeminiKey,
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
      saveGeminiKeyAction,
      removeGeminiKeyAction,
      setGeminiModelAction,
      generateAiProgramAction,
      clearAiProgramAction,
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
