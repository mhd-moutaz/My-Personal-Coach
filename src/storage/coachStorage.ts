import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppSettings, DailyLog, GeneratedPlan, UserProfile } from '../types/coach';
import { getTodayDateKey } from '../utils/units';

const KEYS = {
  SETTINGS: '@mpc/settings',
  PROFILE: '@mpc/profile',
  PLAN: '@mpc/plan',
  DAILY_LOG: '@mpc/daily_log',
} as const;

export const DEFAULT_SETTINGS: AppSettings = {
  language: 'ar',
  theme: 'dark',
  unit: 'kg',
  onboardingCompleted: false,
};

// In-memory fallback prevents unhandled promise rejections if native storage is unavailable.
const memoryFallback: Record<string, string> = {};

async function safeGetItem(key: string): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(key);
  } catch {
    return memoryFallback[key] ?? null;
  }
}

async function safeSetItem(key: string, value: string): Promise<void> {
  memoryFallback[key] = value;
  try {
    await AsyncStorage.setItem(key, value);
  } catch {
    // Fallback already updated in memory
  }
}

async function safeRemoveItem(key: string): Promise<void> {
  delete memoryFallback[key];
  try {
    await AsyncStorage.removeItem(key);
  } catch {
    // Fallback already cleared in memory
  }
}

export function createEmptyDailyLog(dateKey: string = getTodayDateKey()): DailyLog {
  return {
    dateKey,
    waterMl: 0,
    completedMealIds: [],
    workoutCompleted: false,
  };
}

export async function loadAppState(): Promise<{
  settings: AppSettings;
  profile: UserProfile | null;
  plan: GeneratedPlan | null;
  dailyLog: DailyLog;
}> {
  try {
    const [settingsRaw, profileRaw, planRaw, logRaw] = await Promise.all([
      safeGetItem(KEYS.SETTINGS),
      safeGetItem(KEYS.PROFILE),
      safeGetItem(KEYS.PLAN),
      safeGetItem(KEYS.DAILY_LOG),
    ]);

    const settings: AppSettings = settingsRaw
      ? { ...DEFAULT_SETTINGS, ...JSON.parse(settingsRaw) }
      : DEFAULT_SETTINGS;

    const profile: UserProfile | null = profileRaw
      ? JSON.parse(profileRaw)
      : null;

    const plan: GeneratedPlan | null = planRaw ? JSON.parse(planRaw) : null;

    const todayKey = getTodayDateKey();
    let dailyLog = createEmptyDailyLog(todayKey);

    if (logRaw) {
      const parsedLog = JSON.parse(logRaw) as DailyLog;
      if (parsedLog.dateKey === todayKey) {
        dailyLog = parsedLog;
      } else {
        await safeSetItem(KEYS.DAILY_LOG, JSON.stringify(dailyLog));
      }
    }

    return { settings, profile, plan, dailyLog };
  } catch {
    return {
      settings: DEFAULT_SETTINGS,
      profile: null,
      plan: null,
      dailyLog: createEmptyDailyLog(),
    };
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await safeSetItem(KEYS.SETTINGS, JSON.stringify(settings));
}

export async function saveProfileAndPlan(
  profile: UserProfile,
  plan: GeneratedPlan
): Promise<void> {
  await Promise.all([
    safeSetItem(KEYS.PROFILE, JSON.stringify(profile)),
    safeSetItem(KEYS.PLAN, JSON.stringify(plan)),
  ]);
}

export async function saveDailyLog(log: DailyLog): Promise<void> {
  await safeSetItem(KEYS.DAILY_LOG, JSON.stringify(log));
}

export async function clearAllCoachData(): Promise<void> {
  await Promise.all([
    safeRemoveItem(KEYS.SETTINGS),
    safeRemoveItem(KEYS.PROFILE),
    safeRemoveItem(KEYS.PLAN),
    safeRemoveItem(KEYS.DAILY_LOG),
  ]);
}
