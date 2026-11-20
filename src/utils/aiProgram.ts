import { EXERCISES, getExerciseById } from '../data/exercises';
import {
  ExperienceLevel,
  MuscleGroup,
  PlannedExercise,
  TrainingPlace,
  UserProfile,
  WorkoutDayPlan,
} from '../types/coach';
import { ACTIVE_DAY_SLOTS, getAllowedLevels } from './fitness';

export interface AiCatalogItem {
  id: string;
  name: string;
  muscle: MuscleGroup;
  level: ExperienceLevel;
}

export function getActiveDayIndices(trainingDays: number): number[] {
  const clamped = Math.max(1, Math.min(6, Math.round(trainingDays)));
  return [...(ACTIVE_DAY_SLOTS[clamped] ?? ACTIVE_DAY_SLOTS[3])];
}

export function buildCatalogForAi(
  place: TrainingPlace,
  level: ExperienceLevel
): AiCatalogItem[] {
  const allowedLevels = getAllowedLevels(level);
  return EXERCISES.filter(
    (ex) => ex.place === place && allowedLevels.includes(ex.level)
  ).map((ex) => ({
    id: ex.id,
    name: ex.nameEn,
    muscle: ex.muscle,
    level: ex.level,
  }));
}

export function containsPainKeywords(notes: string): boolean {
  const normalized = notes.trim().toLowerCase();
  if (!normalized) return false;

  const keywords = [
    'ألم',
    'الم',
    'وجع',
    'إصابة',
    'اصابة',
    'خلع',
    'كسر',
    'تمزق',
    'التهاب',
    'انزلاق',
    'ديسك',
    'disc',
    'pain',
    'injury',
    'injured',
    'hurt',
    'hurts',
    'sore',
    'ache',
    'strain',
    'sprain',
    'tear',
  ];

  return keywords.some((kw) => normalized.includes(kw));
}

export function buildPrompt(
  profile: UserProfile,
  userNotes: string,
  activeDays: number[],
  catalog: AiCatalogItem[]
): { systemInstruction: string; userPayload: string } {
  const systemInstruction = [
    'You are an experienced strength and conditioning coach.',
    'Design a safe, balanced weekly training split using ONLY exerciseId values present in the provided catalog.',
    'Create exactly one entry in "days" for each dayIndex listed in activeDays, and do not include rest days.',
    'Each active day must contain 4 to 8 unique exercises (no duplicate exerciseId within the same day).',
    'Ensure balanced weekly muscle coverage across activeDays and schedule compound lifts before isolation movements.',
    'Rules for each exercise: sets must be an integer between 2 and 5; reps must be a string like "8-12" or "10"; restSeconds must be between 30 and 180.',
    "Match the user's goal and experience level (beginners get lower total volume and simpler foundational movements).",
    'If the user is under 18 (age < 18): keep volume moderate, keep reps >= 8, and do not prescribe maximal-effort lifting.',
    'Never provide a medical diagnosis. If userNotes mention pain or an injury, avoid loading that area and write a short doctor-consultation recommendation in safetyNote.',
    'Return ONLY valid JSON matching this exact shape (no markdown fences, no extra text):',
    '{ "days": [{ "dayIndex": number, "titleAr": string, "titleEn": string, "exercises": [{ "exerciseId": string, "sets": number, "reps": string, "restSeconds": number }], "cardioFinisherAr"?: string, "cardioFinisherEn"?: string }], "safetyNote"?: string }',
  ].join('\n');

  // Never include profile.name in the outgoing payload.
  const payloadObj = {
    profile: {
      age: profile.age,
      gender: profile.gender,
      heightCm: profile.heightCm,
      weightKg: profile.weightKg,
      targetWeightKg: profile.targetWeightKg,
      goal: profile.goal,
      level: profile.level,
      trainingDays: profile.trainingDays,
      place: profile.place,
    },
    activeDays,
    userNotes: userNotes.trim().slice(0, 300),
    catalog,
  };

  return {
    systemInstruction,
    userPayload: JSON.stringify(payloadObj),
  };
}

const REPS_PATTERN = /^\d{1,2}(-\d{1,2})?$/;

export function validateAiDays(
  raw: unknown,
  ctx: {
    activeDays: number[];
    place: TrainingPlace;
    level: ExperienceLevel;
  }
): { ok: true; days: WorkoutDayPlan[]; safetyNote?: string } | { ok: false; errors: string[] } {
  const errors: string[] = [];

  if (!raw || typeof raw !== 'object') {
    return { ok: false, errors: ['Response root must be a JSON object.'] };
  }

  const root = raw as Record<string, unknown>;
  if (!Array.isArray(root.days)) {
    return { ok: false, errors: ['Response must include a "days" array.'] };
  }

  const allowedLevels = getAllowedLevels(ctx.level);
  const expectedSet = new Set(ctx.activeDays);
  const byDayIndex = new Map<number, WorkoutDayPlan>();

  if (root.days.length !== ctx.activeDays.length) {
    errors.push(
      `Expected exactly ${ctx.activeDays.length} active days, got ${root.days.length}.`
    );
  }

  root.days.forEach((rawDay, idx) => {
    if (!rawDay || typeof rawDay !== 'object') {
      errors.push(`days[${idx}] must be an object.`);
      return;
    }

    const dayObj = rawDay as Record<string, unknown>;
    const dayIndex = dayObj.dayIndex;

    if (
      typeof dayIndex !== 'number' ||
      !Number.isInteger(dayIndex) ||
      !expectedSet.has(dayIndex)
    ) {
      errors.push(
        `days[${idx}].dayIndex (${String(dayIndex)}) is not in activeDays [${ctx.activeDays.join(',')}].`
      );
      return;
    }

    if (byDayIndex.has(dayIndex)) {
      errors.push(`Duplicate dayIndex ${dayIndex} in days.`);
      return;
    }

    const titleArRaw = typeof dayObj.titleAr === 'string' ? dayObj.titleAr.trim() : '';
    const titleEnRaw = typeof dayObj.titleEn === 'string' ? dayObj.titleEn.trim() : '';
    if (!titleArRaw || !titleEnRaw) {
      errors.push(`dayIndex ${dayIndex}: titleAr and titleEn must be non-empty strings.`);
    }

    if (!Array.isArray(dayObj.exercises)) {
      errors.push(`dayIndex ${dayIndex}: exercises must be an array.`);
      return;
    }

    if (dayObj.exercises.length < 4 || dayObj.exercises.length > 8) {
      errors.push(
        `dayIndex ${dayIndex}: expected 4-8 exercises, got ${dayObj.exercises.length}.`
      );
    }

    const seenExIds = new Set<string>();
    const validatedExercises: PlannedExercise[] = [];

    dayObj.exercises.forEach((rawEx, exIdx) => {
      if (!rawEx || typeof rawEx !== 'object') {
        errors.push(`dayIndex ${dayIndex} exercise[${exIdx}] must be an object.`);
        return;
      }

      const exObj = rawEx as Record<string, unknown>;
      const exerciseId =
        typeof exObj.exerciseId === 'string' ? exObj.exerciseId.trim() : '';

      const catalogEx = exerciseId ? getExerciseById(exerciseId) : undefined;
      if (!catalogEx) {
        errors.push(`dayIndex ${dayIndex}: unknown exerciseId "${exerciseId}".`);
        return;
      }
      if (catalogEx.place !== ctx.place) {
        errors.push(
          `dayIndex ${dayIndex}: exerciseId "${exerciseId}" place "${catalogEx.place}" does not match "${ctx.place}".`
        );
      }
      if (!allowedLevels.includes(catalogEx.level)) {
        errors.push(
          `dayIndex ${dayIndex}: exerciseId "${exerciseId}" level "${catalogEx.level}" not allowed for "${ctx.level}".`
        );
      }
      if (seenExIds.has(exerciseId)) {
        errors.push(`dayIndex ${dayIndex}: duplicate exerciseId "${exerciseId}".`);
      }
      seenExIds.add(exerciseId);

      const sets = exObj.sets;
      if (typeof sets !== 'number' || !Number.isInteger(sets) || sets < 2 || sets > 5) {
        errors.push(
          `dayIndex ${dayIndex} (${exerciseId}): sets must be integer 2-5.`
        );
      }

      const reps = typeof exObj.reps === 'string' ? exObj.reps.trim() : '';
      if (!REPS_PATTERN.test(reps)) {
        errors.push(
          `dayIndex ${dayIndex} (${exerciseId}): invalid reps "${String(exObj.reps)}".`
        );
      }

      const restSeconds = exObj.restSeconds;
      if (
        typeof restSeconds !== 'number' ||
        !Number.isFinite(restSeconds) ||
        restSeconds < 30 ||
        restSeconds > 180
      ) {
        errors.push(
          `dayIndex ${dayIndex} (${exerciseId}): restSeconds must be 30-180.`
        );
      }

      validatedExercises.push({
        exerciseId,
        sets: typeof sets === 'number' ? Math.round(sets) : 3,
        reps,
        restSeconds:
          typeof restSeconds === 'number' ? Math.round(restSeconds) : 60,
      });
    });

    const finisherArRaw =
      typeof dayObj.cardioFinisherAr === 'string'
        ? dayObj.cardioFinisherAr.trim().slice(0, 120)
        : '';
    const finisherEnRaw =
      typeof dayObj.cardioFinisherEn === 'string'
        ? dayObj.cardioFinisherEn.trim().slice(0, 120)
        : '';
    const hasFinisher = Boolean(finisherArRaw || finisherEnRaw);

    byDayIndex.set(dayIndex, {
      dayIndex,
      isRestDay: false,
      splitType: 'full_body',
      titleAr: titleArRaw.slice(0, 60),
      titleEn: titleEnRaw.slice(0, 60),
      exercises: validatedExercises,
      ...(finisherArRaw ? { cardioFinisherAr: finisherArRaw } : {}),
      ...(finisherEnRaw ? { cardioFinisherEn: finisherEnRaw } : {}),
      estimatedMinutes: validatedExercises.length * 7 + (hasFinisher ? 15 : 0),
    });
  });

  for (const activeDay of ctx.activeDays) {
    if (!byDayIndex.has(activeDay)) {
      errors.push(`Missing active dayIndex ${activeDay}.`);
    }
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  const fullWeek: WorkoutDayPlan[] = Array.from({ length: 7 }, (_, dayIndex) => {
    const activeDay = byDayIndex.get(dayIndex);
    if (activeDay) return activeDay;
    return {
      dayIndex,
      isRestDay: true,
      splitType: 'rest',
      titleAr: 'يوم راحة واستشفاء',
      titleEn: 'Rest & Recovery',
      exercises: [],
      estimatedMinutes: 0,
    };
  });

  const safetyNoteRaw =
    typeof root.safetyNote === 'string' ? root.safetyNote.trim().slice(0, 300) : '';

  return {
    ok: true,
    days: fullWeek,
    ...(safetyNoteRaw ? { safetyNote: safetyNoteRaw } : {}),
  };
}
