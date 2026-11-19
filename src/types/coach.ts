export type Gender = 'male' | 'female';

export type Goal =
  | 'fat_loss'
  | 'muscle_gain'
  | 'improve_fitness'
  | 'maintain_weight';

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';

export type TrainingPlace = 'gym' | 'home';

export type DietPreference =
  | 'regular'
  | 'vegetarian'
  | 'keto'
  | 'lactose_free';

export type Allergy =
  | 'dairy'
  | 'nuts'
  | 'gluten'
  | 'eggs'
  | 'seafood'
  | 'soy';

export type Language = 'ar' | 'en';
export type ThemeMode = 'dark' | 'light';
export type WeightUnit = 'kg' | 'lb';

export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'legs'
  | 'arms'
  | 'core'
  | 'cardio';

export interface Exercise {
  id: string;
  nameAr: string;
  nameEn: string;
  muscle: MuscleGroup;
  place: TrainingPlace;
  level: ExperienceLevel;
  youtubeVideoId?: string;
}

export type SplitType =
  | 'full_body'
  | 'upper'
  | 'lower'
  | 'push'
  | 'pull'
  | 'legs'
  | 'rest';

export const PLAN_VERSION = 2;

export interface PlannedExercise {
  exerciseId: string;
  sets: number;
  reps: string;
  restSeconds: number;
}

export interface WorkoutDayPlan {
  dayIndex: number; // 0 = Sunday .. 6 = Saturday
  isRestDay: boolean;
  splitType: SplitType;
  titleAr: string;
  titleEn: string;
  exercises: PlannedExercise[];
  cardioFinisherAr?: string;
  cardioFinisherEn?: string;
  estimatedMinutes: number;
}

export interface MacroTargets {
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export type MealSlot = 'breakfast' | 'lunch' | 'snack' | 'dinner';

export interface MealTemplate {
  id: string;
  slot: MealSlot;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  diets: DietPreference[];
  allergens: Allergy[];
  calorieRatio: number; // proportion of daily calories
}

export interface PlannedMeal {
  id: string;
  slot: MealSlot;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export interface UserProfile {
  name: string;
  age: number;
  gender: Gender;
  heightCm: number;
  weightKg: number;
  targetWeightKg: number;
  goal: Goal;
  level: ExperienceLevel;
  trainingDays: number; // 1..6
  place: TrainingPlace;
  diet: DietPreference;
  allergies: Allergy[];
}

export interface SafetyNotices {
  isUnder18: boolean;
  minorMaintenanceApplied: boolean;
  targetAdjusted: boolean;
  originalTargetWeightKg: number;
  adjustedTargetWeightKg: number;
  targetAdjustmentReason?: 'too_low_bmi' | 'too_high_bmi' | 'goal_direction_mismatch' | 'extreme_delta';
  calorieFloorApplied: boolean;
  deficitCapped: boolean;
}

export interface GeneratedPlan {
  planVersion: number;
  bmr: number;
  tdee: number;
  activityMultiplier: number;
  targetCalories: number;
  macros: MacroTargets;
  waterGoalMl: number;
  weeklySchedule: WorkoutDayPlan[];
  dailyMeals: PlannedMeal[];
  safetyNotices: SafetyNotices;
  generatedAt: string;
}

export interface DailyLog {
  dateKey: string; // YYYY-MM-DD
  waterMl: number;
  completedMealIds: string[];
  workoutCompleted: boolean;
}

export interface AppSettings {
  language: Language;
  theme: ThemeMode;
  unit: WeightUnit;
  onboardingCompleted: boolean;
}

export type TabKey = 'home' | 'workouts' | 'nutrition' | 'progress' | 'profile';
