import { getExerciseById } from '../src/data/exercises';
import {
  DietPreference,
  ExperienceLevel,
  Gender,
  Goal,
  PLAN_VERSION,
  TrainingPlace,
  UserProfile,
} from '../src/types/coach';
import { generatePersonalPlan } from '../src/utils/fitness';

const GENDERS: Gender[] = ['male', 'female'];
const AGES = [15, 17, 18, 30];
const GOALS: Goal[] = [
  'fat_loss',
  'muscle_gain',
  'improve_fitness',
  'maintain_weight',
];
const LEVELS: ExperienceLevel[] = ['beginner', 'intermediate', 'advanced'];
const TRAINING_DAYS = [1, 2, 3, 4, 5, 6];
const PLACES: TrainingPlace[] = ['gym', 'home'];
const DIETS: DietPreference[] = [
  'regular',
  'vegetarian',
  'keto',
  'lactose_free',
];

let totalPlans = 0;
let totalWorkoutDays = 0;
const failures: string[] = [];

for (const gender of GENDERS) {
  for (const age of AGES) {
    for (const goal of GOALS) {
      for (const level of LEVELS) {
        for (const trainingDays of TRAINING_DAYS) {
          for (const place of PLACES) {
            for (const diet of DIETS) {
              const profile: UserProfile = {
                name: 'Test',
                age,
                gender,
                heightCm: gender === 'male' ? 175 : 163,
                weightKg: gender === 'male' ? 75 : 62,
                targetWeightKg:
                  goal === 'fat_loss'
                    ? gender === 'male'
                      ? 70
                      : 58
                    : goal === 'muscle_gain'
                    ? gender === 'male'
                      ? 80
                      : 66
                    : gender === 'male'
                    ? 75
                    : 62,
                goal,
                level,
                trainingDays,
                place,
                diet,
                allergies: [],
              };

              const { plan } = generatePersonalPlan(profile);
              totalPlans += 1;

              const label = `${gender}/age=${age}/${goal}/${level}/days=${trainingDays}/${place}/${diet}`;

              if (plan.planVersion !== PLAN_VERSION) {
                failures.push(
                  `${label}: expected planVersion=${PLAN_VERSION}, got ${plan.planVersion}`
                );
              }

              // 4. age < 18 with fat_loss -> targetCalories === tdee
              if (age < 18 && goal === 'fat_loss') {
                if (plan.targetCalories !== plan.tdee) {
                  failures.push(
                    `${label}: minor fat_loss expected targetCalories=${plan.tdee}, got ${plan.targetCalories}`
                  );
                }
                if (!plan.safetyNotices.minorMaintenanceApplied) {
                  failures.push(
                    `${label}: expected minorMaintenanceApplied=true`
                  );
                }
              }

              // 5. targetCalories >= floor (1500 male / 1200 female), except minors on maintenance
              const isMinorOnMaintenance = age < 18 && goal === 'fat_loss';
              const floor = gender === 'male' ? 1500 : 1200;
              if (!isMinorOnMaintenance && plan.targetCalories < floor) {
                failures.push(
                  `${label}: targetCalories ${plan.targetCalories} below floor ${floor}`
                );
              }

              for (const day of plan.weeklySchedule) {
                if (day.isRestDay) continue;
                totalWorkoutDays += 1;

                // 1. every non-rest day has >= 4 exercises and no duplicate exerciseIds
                if (day.exercises.length < 4) {
                  failures.push(
                    `${label} day=${day.dayIndex} (${day.splitType}): only ${day.exercises.length} exercises`
                  );
                }

                const seenIds = new Set<string>();
                const muscles = new Set<string>();

                for (const item of day.exercises) {
                  if (seenIds.has(item.exerciseId)) {
                    failures.push(
                      `${label} day=${day.dayIndex}: duplicate exerciseId ${item.exerciseId}`
                    );
                  }
                  seenIds.add(item.exerciseId);

                  // 2. every exerciseId exists in the catalog
                  const resolved = getExerciseById(item.exerciseId);
                  if (!resolved) {
                    failures.push(
                      `${label} day=${day.dayIndex}: unknown exerciseId ${item.exerciseId}`
                    );
                  } else {
                    muscles.add(resolved.muscle);
                  }
                }

                // 3. full_body days contain at least one legs and one core exercise
                if (day.splitType === 'full_body') {
                  if (!muscles.has('legs') || !muscles.has('core')) {
                    failures.push(
                      `${label} day=${day.dayIndex}: full_body missing legs or core (muscles=${Array.from(
                        muscles
                      ).join(',')})`
                    );
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}

if (failures.length > 0) {
  console.error(
    `Plan sanity check FAILED (${failures.length} failure(s) across ${totalPlans} plans):`
  );
  for (const err of failures.slice(0, 20)) {
    console.error(`  - ${err}`);
  }
  process.exit(1);
}

console.log(
  `Plan sanity check PASSED: ${totalPlans} plans and ${totalWorkoutDays} workout days verified with 0 failures.`
);
