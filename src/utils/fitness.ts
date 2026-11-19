import { EXERCISES } from '../data/exercises';
import { buildDailyMeals } from '../data/meals';
import {
  DietPreference,
  Exercise,
  ExperienceLevel,
  Gender,
  GeneratedPlan,
  Goal,
  MacroTargets,
  MuscleGroup,
  PLAN_VERSION,
  PlannedExercise,
  SafetyNotices,
  SplitType,
  TrainingPlace,
  UserProfile,
  WorkoutDayPlan,
} from '../types/coach';

export interface ValidationErrors {
  age?: 'invalid_age';
  heightCm?: 'invalid_height';
  weightKg?: 'invalid_weight';
  targetWeightKg?: 'invalid_target_weight';
}

export function validateBasicInputs(input: {
  age: number;
  heightCm: number;
  weightKg: number;
  targetWeightKg: number;
}): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!Number.isFinite(input.age) || input.age < 14 || input.age > 80) {
    errors.age = 'invalid_age';
  }
  if (
    !Number.isFinite(input.heightCm) ||
    input.heightCm < 120 ||
    input.heightCm > 230
  ) {
    errors.heightCm = 'invalid_height';
  }
  if (
    !Number.isFinite(input.weightKg) ||
    input.weightKg < 35 ||
    input.weightKg > 250
  ) {
    errors.weightKg = 'invalid_weight';
  }
  if (
    !Number.isFinite(input.targetWeightKg) ||
    input.targetWeightKg < 35 ||
    input.targetWeightKg > 250
  ) {
    errors.targetWeightKg = 'invalid_target_weight';
  }

  return errors;
}

export function getActivityMultiplier(trainingDays: number): number {
  if (trainingDays <= 2) return 1.375;
  if (trainingDays <= 4) return 1.55;
  return 1.725;
}

export function calculateBmrMifflinStJeor(
  gender: Gender,
  weightKg: number,
  heightCm: number,
  age: number
): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return Math.round(gender === 'male' ? base + 5 : base - 161);
}

export function calculateWaterGoalMl(weightKg: number): number {
  const raw = weightKg * 35;
  const rounded = Math.round(raw / 250) * 250;
  return Math.max(1500, rounded);
}

function evaluateTargetWeight(profile: UserProfile): {
  adjustedTargetWeightKg: number;
  targetAdjusted: boolean;
  reason?: SafetyNotices['targetAdjustmentReason'];
} {
  const heightM = profile.heightCm / 100;
  const minHealthyWeight = Math.max(
    35,
    Math.round(18.5 * heightM * heightM * 10) / 10
  );
  const maxHealthyWeight = Math.min(
    250,
    Math.round(35 * heightM * heightM * 10) / 10
  );

  let adjusted = profile.targetWeightKg;
  let reason: SafetyNotices['targetAdjustmentReason'];

  if (adjusted < minHealthyWeight) {
    adjusted = minHealthyWeight;
    reason = 'too_low_bmi';
  } else if (adjusted > maxHealthyWeight && profile.goal === 'muscle_gain') {
    adjusted = maxHealthyWeight;
    reason = 'too_high_bmi';
  }

  if (profile.goal === 'fat_loss' && adjusted >= profile.weightKg) {
    adjusted = Math.max(
      minHealthyWeight,
      Math.round(profile.weightKg * 0.94 * 10) / 10
    );
    reason = 'goal_direction_mismatch';
  } else if (profile.goal === 'muscle_gain' && adjusted <= profile.weightKg) {
    adjusted = Math.min(
      maxHealthyWeight,
      Math.round(profile.weightKg * 1.05 * 10) / 10
    );
    reason = 'goal_direction_mismatch';
  } else if (
    profile.goal === 'fat_loss' &&
    (profile.weightKg - adjusted) / profile.weightKg > 0.25
  ) {
    adjusted = Math.max(
      minHealthyWeight,
      Math.round(profile.weightKg * 0.8 * 10) / 10
    );
    reason = 'extreme_delta';
  }

  return {
    adjustedTargetWeightKg: adjusted,
    targetAdjusted: Math.abs(adjusted - profile.targetWeightKg) >= 0.2,
    reason,
  };
}

export function calculateSafeCalories(
  tdee: number,
  gender: Gender,
  weightKg: number,
  goal: Goal,
  level: ExperienceLevel,
  age: number
): {
  targetCalories: number;
  calorieFloorApplied: boolean;
  deficitCapped: boolean;
  minorMaintenanceApplied: boolean;
} {
  if (age < 18 && goal === 'fat_loss') {
    return {
      targetCalories: tdee,
      calorieFloorApplied: false,
      deficitCapped: false,
      minorMaintenanceApplied: true,
    };
  }

  const minFloor = gender === 'male' ? 1500 : 1200;
  let rawTarget = tdee;
  let deficitCapped = false;

  if (goal === 'fat_loss') {
    // 1% body weight/week ~= weightKg * 0.01 * 7700 / 7 ~= weightKg * 11 kcal/day
    const maxSafeDailyDeficit = Math.round(weightKg * 11);
    const desiredDeficit = 500;
    const appliedDeficit = Math.min(desiredDeficit, maxSafeDailyDeficit);
    deficitCapped = maxSafeDailyDeficit < desiredDeficit;
    rawTarget = tdee - appliedDeficit;
  } else if (goal === 'muscle_gain') {
    const moderateSurplus =
      age < 18
        ? 200
        : level === 'beginner' || gender === 'female'
        ? 250
        : 300;
    rawTarget = tdee + moderateSurplus;
  }

  const targetCalories = Math.max(minFloor, Math.round(rawTarget));
  return {
    targetCalories,
    calorieFloorApplied: rawTarget < minFloor,
    deficitCapped,
    minorMaintenanceApplied: false,
  };
}

export function calculateMacros(
  targetCalories: number,
  goal: Goal,
  diet: DietPreference
): MacroTargets {
  let proteinRatio = 0.3;
  let carbsRatio = 0.4;
  let fatRatio = 0.3;

  if (diet === 'keto') {
    proteinRatio = 0.25;
    carbsRatio = 0.05;
    fatRatio = 0.7;
  } else if (diet === 'vegetarian') {
    if (goal === 'fat_loss') {
      proteinRatio = 0.3;
      carbsRatio = 0.42;
      fatRatio = 0.28;
    } else if (goal === 'muscle_gain') {
      proteinRatio = 0.28;
      carbsRatio = 0.47;
      fatRatio = 0.25;
    } else {
      proteinRatio = 0.26;
      carbsRatio = 0.46;
      fatRatio = 0.28;
    }
  } else {
    if (goal === 'fat_loss') {
      proteinRatio = 0.35;
      carbsRatio = 0.35;
      fatRatio = 0.3;
    } else if (goal === 'muscle_gain') {
      proteinRatio = 0.3;
      carbsRatio = 0.45;
      fatRatio = 0.25;
    } else {
      proteinRatio = 0.3;
      carbsRatio = 0.4;
      fatRatio = 0.3;
    }
  }

  const proteinG = Math.round((targetCalories * proteinRatio) / 4);
  const carbsG = Math.round((targetCalories * carbsRatio) / 4);
  const fatG = Math.round((targetCalories * fatRatio) / 9);

  return { proteinG, carbsG, fatG };
}

// Evenly spaced active days (0 = Sunday .. 6 = Saturday)
const ACTIVE_DAY_SLOTS: Record<number, number[]> = {
  1: [1],
  2: [1, 4],
  3: [1, 3, 5],
  4: [0, 1, 3, 4],
  5: [0, 1, 2, 4, 5],
  6: [0, 1, 2, 3, 4, 5],
};

function getSplitSequence(trainingDays: number): SplitType[] {
  const clamped = Math.max(1, Math.min(6, trainingDays));
  if (clamped <= 2) {
    return Array(clamped).fill('full_body');
  }
  if (clamped === 3) {
    return ['full_body', 'full_body', 'full_body'];
  }
  if (clamped === 4) {
    return ['upper', 'lower', 'upper', 'lower'];
  }
  if (clamped === 5) {
    return ['push', 'pull', 'legs', 'upper', 'lower'];
  }
  return ['push', 'pull', 'legs', 'push', 'pull', 'legs'];
}

function getSplitTitle(split: SplitType): { ar: string; en: string } {
  switch (split) {
    case 'full_body':
      return { ar: 'تمرين الجسم بالكامل', en: 'Full Body Workout' };
    case 'upper':
      return { ar: 'تمرين الجزء العلوي', en: 'Upper Body' };
    case 'lower':
      return { ar: 'تمرين الجزء السفلي', en: 'Lower Body' };
    case 'push':
      return { ar: 'دفع (صدر، أكتاف، ترايسبس)', en: 'Push (Chest, Shoulders, Triceps)' };
    case 'pull':
      return { ar: 'سحب (ظهر، بايسبس)', en: 'Pull (Back, Biceps)' };
    case 'legs':
      return { ar: 'الأرجل والبطن', en: 'Legs & Core' };
    case 'rest':
    default:
      return { ar: 'يوم راحة واستشفاء', en: 'Rest & Recovery' };
  }
}

function getAllowedLevels(level: ExperienceLevel): ExperienceLevel[] {
  if (level === 'beginner') return ['beginner'];
  if (level === 'intermediate') return ['beginner', 'intermediate'];
  return ['beginner', 'intermediate', 'advanced'];
}

function getMusclesForSplit(split: SplitType): MuscleGroup[] {
  switch (split) {
    case 'full_body':
      return ['legs', 'chest', 'back', 'shoulders', 'core'];
    case 'upper':
      return ['chest', 'back', 'shoulders', 'arms'];
    case 'lower':
      return ['legs', 'core'];
    case 'push':
      return ['chest', 'shoulders', 'arms'];
    case 'pull':
      return ['back', 'arms', 'core'];
    case 'legs':
      return ['legs', 'core'];
    default:
      return [];
  }
}

function buildPrescription(
  goal: Goal,
  level: ExperienceLevel,
  exerciseIndex: number
): { sets: number; reps: string; restSeconds: number } {
  let baseSets = 3;
  let reps = '10-12';
  let restSeconds = 60;

  if (goal === 'muscle_gain') {
    baseSets = exerciseIndex < 2 ? 4 : 3;
    reps = '8-12';
    restSeconds = exerciseIndex < 2 ? 90 : 60;
  } else if (goal === 'fat_loss') {
    baseSets = 3;
    reps = '12-15';
    restSeconds = exerciseIndex < 2 ? 60 : 40;
  } else if (goal === 'improve_fitness') {
    baseSets = 3;
    reps = exerciseIndex % 2 === 0 ? '10-12' : '12-15';
    restSeconds = 45;
  } else {
    baseSets = 3;
    reps = '10-12';
    restSeconds = 60;
  }

  if (level === 'beginner') {
    baseSets = Math.max(2, baseSets - 1);
  } else if (level === 'advanced') {
    baseSets = Math.min(4, baseSets + (exerciseIndex < 3 ? 1 : 0));
  }

  return { sets: baseSets, reps, restSeconds };
}

function selectExercisesForDay(
  split: SplitType,
  place: TrainingPlace,
  level: ExperienceLevel,
  goal: Goal,
  sessionIndex: number
): PlannedExercise[] {
  const allowedLevels = getAllowedLevels(level);
  const pool = EXERCISES.filter(
    (ex) => ex.place === place && allowedLevels.includes(ex.level)
  );
  const muscles = getMusclesForSplit(split);
  const targetCount =
    split === 'full_body'
      ? level === 'beginner'
        ? 5
        : 6
      : level === 'beginner'
      ? 4
      : level === 'intermediate'
      ? 5
      : 6;

  const selected: Exercise[] = [];
  const selectedIds = new Set<string>();

  const pickRotating = (candidates: Exercise[], offset: number): Exercise | undefined => {
    if (candidates.length === 0) return undefined;
    return candidates[(sessionIndex + offset) % candidates.length];
  };

  // Pass 1: pick one movement per target muscle group, rotating by sessionIndex for all levels
  for (let i = 0; i < muscles.length; i += 1) {
    if (selected.length >= targetCount) break;
    const muscle = muscles[i];
    const candidates = pool.filter(
      (ex) => ex.muscle === muscle && !selectedIds.has(ex.id)
    );
    const picked = pickRotating(candidates, 0);
    if (picked) {
      selected.push(picked);
      selectedIds.add(picked.id);
    }
  }

  // Pass 2: fill remaining slots from target muscles, rotating by sessionIndex
  let pass2Attempts = 0;
  let muscleCursor = sessionIndex;
  while (selected.length < targetCount && pass2Attempts < muscles.length * 4) {
    const muscle = muscles[muscleCursor % muscles.length];
    const candidates = pool.filter(
      (ex) => ex.muscle === muscle && !selectedIds.has(ex.id)
    );
    const picked = pickRotating(candidates, pass2Attempts);
    if (picked) {
      selected.push(picked);
      selectedIds.add(picked.id);
    }
    muscleCursor += 1;
    pass2Attempts += 1;
  }

  // Final fallback pass: fill from any muscle in the allowed-level pool not already selected
  let fallbackOffset = 0;
  while (selected.length < targetCount) {
    const remaining = pool.filter((ex) => !selectedIds.has(ex.id));
    const picked = pickRotating(remaining, fallbackOffset);
    if (!picked) break;
    selected.push(picked);
    selectedIds.add(picked.id);
    fallbackOffset += 1;
  }

  return selected.map((exercise, idx) => {
    const rx = buildPrescription(goal, level, idx);
    return {
      exerciseId: exercise.id,
      sets: rx.sets,
      reps: rx.reps,
      restSeconds: rx.restSeconds,
    };
  });
}

export function generateWeeklyWorkoutSchedule(
  trainingDays: number,
  goal: Goal,
  level: ExperienceLevel,
  place: TrainingPlace
): WorkoutDayPlan[] {
  const clampedDays = Math.max(1, Math.min(6, trainingDays));
  const activeIndices = ACTIVE_DAY_SLOTS[clampedDays] ?? ACTIVE_DAY_SLOTS[3];
  const splits = getSplitSequence(clampedDays);

  let sessionCursor = 0;

  return Array.from({ length: 7 }, (_, dayIndex) => {
    const activeSlot = activeIndices.indexOf(dayIndex);
    if (activeSlot === -1) {
      const restTitle = getSplitTitle('rest');
      return {
        dayIndex,
        isRestDay: true,
        splitType: 'rest',
        titleAr: restTitle.ar,
        titleEn: restTitle.en,
        exercises: [],
        estimatedMinutes: 0,
      };
    }

    const splitType = splits[activeSlot] ?? 'full_body';
    const title = getSplitTitle(splitType);
    const exercises = selectExercisesForDay(
      splitType,
      place,
      level,
      goal,
      sessionCursor
    );
    sessionCursor += 1;

    const hasFinisher = goal === 'fat_loss' || goal === 'improve_fitness';
    const cardioFinisherAr =
      goal === 'fat_loss'
        ? place === 'gym'
          ? 'خاتمة كارديو خفيفة: ١٥ دقيقة مشي سريع أو دراجة ثابتة'
          : 'خاتمة كارديو خفيفة: ١٥ دقيقة مشي نشط أو صعود الدرج'
        : goal === 'improve_fitness'
        ? 'خاتمة لياقة: ١٠ دقائق كارديو متوسط الشدة'
        : undefined;

    const cardioFinisherEn =
      goal === 'fat_loss'
        ? place === 'gym'
          ? 'Light cardio finisher: 15 min brisk incline walk or stationary bike'
          : 'Light cardio finisher: 15 min brisk marching or step-ups'
        : goal === 'improve_fitness'
        ? 'Conditioning finisher: 10 min moderate cardio'
        : undefined;

    const baseMinutes = exercises.length * 7 + (hasFinisher ? 15 : 0);

    return {
      dayIndex,
      isRestDay: false,
      splitType,
      titleAr: title.ar,
      titleEn: title.en,
      exercises,
      cardioFinisherAr,
      cardioFinisherEn,
      estimatedMinutes: baseMinutes,
    };
  });
}

export function generatePersonalPlan(profile: UserProfile): {
  sanitizedProfile: UserProfile;
  plan: GeneratedPlan;
} {
  const targetEval = evaluateTargetWeight(profile);
  const sanitizedProfile: UserProfile = {
    ...profile,
    targetWeightKg: targetEval.adjustedTargetWeightKg,
  };

  const bmr = calculateBmrMifflinStJeor(
    profile.gender,
    profile.weightKg,
    profile.heightCm,
    profile.age
  );
  const activityMultiplier = getActivityMultiplier(profile.trainingDays);
  const tdee = Math.round(bmr * activityMultiplier);

  const calorieOutcome = calculateSafeCalories(
    tdee,
    profile.gender,
    profile.weightKg,
    profile.goal,
    profile.level,
    profile.age
  );

  const macros = calculateMacros(
    calorieOutcome.targetCalories,
    profile.goal,
    profile.diet
  );
  const waterGoalMl = calculateWaterGoalMl(profile.weightKg);

  const weeklySchedule = generateWeeklyWorkoutSchedule(
    profile.trainingDays,
    profile.goal,
    profile.level,
    profile.place
  );

  const dailyMeals = buildDailyMeals(
    profile.diet,
    profile.allergies,
    calorieOutcome.targetCalories,
    macros
  );

  const safetyNotices: SafetyNotices = {
    isUnder18: profile.age < 18,
    minorMaintenanceApplied: calorieOutcome.minorMaintenanceApplied,
    targetAdjusted: targetEval.targetAdjusted,
    originalTargetWeightKg: profile.targetWeightKg,
    adjustedTargetWeightKg: targetEval.adjustedTargetWeightKg,
    targetAdjustmentReason: targetEval.reason,
    calorieFloorApplied: calorieOutcome.calorieFloorApplied,
    deficitCapped: calorieOutcome.deficitCapped,
  };

  return {
    sanitizedProfile,
    plan: {
      planVersion: PLAN_VERSION,
      bmr,
      tdee,
      activityMultiplier,
      targetCalories: calorieOutcome.targetCalories,
      macros,
      waterGoalMl,
      weeklySchedule,
      dailyMeals,
      safetyNotices,
      generatedAt: new Date().toISOString(),
    },
  };
}
