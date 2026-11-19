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
      AsyncStorage.getItem(KEYS.SETTINGS),
      AsyncStorage.getItem(KEYS.PROFILE),
      AsyncStorage.getItem(KEYS.PLAN),
      AsyncStorage.getItem(KEYS.DAILY_LOG),
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
        await AsyncStorage.setItem(KEYS.DAILY_LOG, JSON.stringify(dailyLog));
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
  await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
}

export async function saveProfileAndPlan(
  profile: UserProfile,
  plan: GeneratedPlan
): Promise<void> {
  await Promise.all([
    AsyncStorage.setItem(KEYS.PROFILE, JSON.stringify(profile)),
    AsyncStorage.setItem(KEYS.PLAN, JSON.stringify(plan)),
  ]);
}

export async function saveDailyLog(log: DailyLog): Promise<void> {
  await AsyncStorage.setItem(KEYS.DAILY_LOG, JSON.stringify(log));
}

export async function clearAllCoachData(): Promise<void> {
  await Promise.all([
    AsyncStorage.removeItem(KEYS.SETTINGS),
    AsyncStorage.removeItem(KEYS.PROFILE),
    AsyncStorage.removeItem(KEYS.PLAN),
    AsyncStorage.removeItem(KEYS.DAILY_LOG),
  ]);
}
