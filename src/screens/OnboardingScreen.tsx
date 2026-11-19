import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  Droplets,
  Dumbbell,
  Flame,
  Home as HomeIcon,
  Info,
  Sparkles,
} from 'lucide-react-native';
import Svg, { Circle } from 'react-native-svg';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { useCoach } from '../context/CoachContext';
import { FONTS, RADIUS } from '../theme/tokens';
import {
  Allergy,
  DietPreference,
  ExperienceLevel,
  Gender,
  GeneratedPlan,
  Goal,
  TrainingPlace,
  UserProfile,
} from '../types/coach';
import {
  generatePersonalPlan,
  validateBasicInputs,
  ValidationErrors,
} from '../utils/fitness';
import {
  formatWeight,
  fromDisplayWeight,
  toDisplayWeight,
} from '../utils/units';

const TOTAL_STEPS = 6;

const ALLERGY_OPTIONS: Allergy[] = [
  'dairy',
  'nuts',
  'gluten',
  'eggs',
  'seafood',
  'soy',
];

export function OnboardingScreen() {
  const {
    palette,
    isRTL,
    settings,
    profile: existingProfile,
    isReeditingOnboarding,
    t,
    daysShort,
    completeOnboarding,
    cancelRecalculation,
    setLanguage,
  } = useCoach();
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState<number>(1);
  const [name, setName] = useState(existingProfile?.name ?? '');
  const [ageStr, setAgeStr] = useState(
    existingProfile ? String(existingProfile.age) : '26'
  );
  const [gender, setGender] = useState<Gender>(
    existingProfile?.gender ?? 'male'
  );
  const [heightStr, setHeightStr] = useState(
    existingProfile ? String(existingProfile.heightCm) : '175'
  );
  const [weightStr, setWeightStr] = useState(
    existingProfile
      ? String(toDisplayWeight(existingProfile.weightKg, settings.unit))
      : settings.unit === 'lb'
      ? '172'
      : '78'
  );
  const [targetWeightStr, setTargetWeightStr] = useState(
    existingProfile
      ? String(toDisplayWeight(existingProfile.targetWeightKg, settings.unit))
      : settings.unit === 'lb'
      ? '158'
      : '72'
  );

  const [goal, setGoal] = useState<Goal>(existingProfile?.goal ?? 'fat_loss');
  const [level, setLevel] = useState<ExperienceLevel>(
    existingProfile?.level ?? 'beginner'
  );
  const [trainingDays, setTrainingDays] = useState<number>(
    existingProfile?.trainingDays ?? 4
  );
  const [place, setPlace] = useState<TrainingPlace>(
    existingProfile?.place ?? 'gym'
  );
  const [diet, setDiet] = useState<DietPreference>(
    existingProfile?.diet ?? 'regular'
  );
  const [allergies, setAllergies] = useState<Allergy[]>(
    existingProfile?.allergies ?? []
  );

  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );
  const [genStage, setGenStage] = useState<number>(0);
  const [previewPlan, setPreviewPlan] = useState<{
    sanitizedProfile: UserProfile;
    plan: GeneratedPlan;
  } | null>(null);

  const spinValue = useRef(new Animated.Value(0)).current;

  const currentProfileDraft = useMemo<UserProfile>(() => {
    const parsedAge = parseInt(ageStr, 10);
    const parsedHeight = parseFloat(heightStr);
    const parsedWeight = fromDisplayWeight(
      parseFloat(weightStr),
      settings.unit
    );
    const parsedTarget = fromDisplayWeight(
      parseFloat(targetWeightStr),
      settings.unit
    );

    return {
      name: name.trim(),
      age: parsedAge,
      gender,
      heightCm: parsedHeight,
      weightKg: parsedWeight,
      targetWeightKg: parsedTarget,
      goal,
      level,
      trainingDays,
      place,
      diet,
      allergies,
    };
  }, [
    name,
    ageStr,
    gender,
    heightStr,
    weightStr,
    targetWeightStr,
    settings.unit,
    goal,
    level,
    trainingDays,
    place,
    diet,
    allergies,
  ]);

  // Step 5 deterministic "Generating your plan" animation (no AI)
  useEffect(() => {
    if (step !== 5) return;

    setGenStage(0);
    spinValue.setValue(0);
    const anim = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1300,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    anim.start();

    const t1 = setTimeout(() => setGenStage(1), 450);
    const t2 = setTimeout(() => setGenStage(2), 950);
    const t3 = setTimeout(() => setGenStage(3), 1450);
    const t4 = setTimeout(() => {
      const result = generatePersonalPlan(currentProfileDraft);
      setPreviewPlan(result);
      setStep(6);
    }, 2050);

    return () => {
      anim.stop();
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [step, currentProfileDraft, spinValue]);

  const spinRotate = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handleNext = () => {
    if (step === 1) {
      const errors = validateBasicInputs({
        age: currentProfileDraft.age,
        heightCm: currentProfileDraft.heightCm,
        weightKg: currentProfileDraft.weightKg,
        targetWeightKg: currentProfileDraft.targetWeightKg,
      });
      setValidationErrors(errors);
      if (Object.keys(errors).length > 0) return;
      setStep(2);
      return;
    }

    if (step < 5) {
      setStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    if (step === 1) {
      if (isReeditingOnboarding) {
        cancelRecalculation();
      }
      return;
    }
    if (step === 6) {
      setStep(4);
      return;
    }
    if (step === 5) {
      setStep(4);
      return;
    }
    setStep((s) => Math.max(1, s - 1));
  };

  const toggleAllergy = (item: Allergy) => {
    setAllergies((prev) =>
      prev.includes(item) ? prev.filter((a) => a !== item) : [...prev, item]
    );
  };

  const handleStartJourney = async () => {
    if (!previewPlan) return;
    await completeOnboarding(previewPlan.sanitizedProfile);
  };

  const weightUnitLabel =
    settings.unit === 'kg'
      ? settings.language === 'ar'
        ? 'كجم'
        : 'kg'
      : settings.language === 'ar'
      ? 'رطل'
      : 'lb';

  const progressPct = Math.round((step / TOTAL_STEPS) * 100);
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: palette.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Top Progress Header */}
      <View
        style={[
          styles.header,
          { paddingTop: Math.max(insets.top + 8, 20) },
        ]}
      >
        <View
          style={[
            styles.headerRow,
            { flexDirection: isRTL ? 'row-reverse' : 'row' },
          ]}
        >
          {step > 1 || isReeditingOnboarding ? (
            <Pressable
              onPress={handleBack}
              style={[
                styles.iconBtn,
                {
                  backgroundColor: palette.card,
                  borderColor: palette.border,
                },
              ]}
              accessibilityLabel={t('backBtn')}
            >
              <BackIcon size={20} color={palette.text} />
            </Pressable>
          ) : (
            <View style={styles.iconSpacer} />
          )}

          <Text style={[styles.stepCounter, { color: palette.textMuted }]}>
            {t('stepOf', { current: step, total: TOTAL_STEPS })}
          </Text>

          <Pressable
            onPress={() =>
              setLanguage(settings.language === 'ar' ? 'en' : 'ar')
            }
            style={[
              styles.langToggle,
              {
                backgroundColor: palette.card,
                borderColor: palette.border,
              },
            ]}
          >
            <Text style={[styles.langToggleText, { color: palette.text }]}>
              {settings.language === 'ar' ? 'EN' : 'AR'}
            </Text>
          </Pressable>
        </View>

        <View
          style={[
            styles.progressTrack,
            { backgroundColor: palette.cardElevated },
          ]}
        >
          <View
            style={[
              styles.progressFill,
              {
                width: `${progressPct}%`,
                backgroundColor:
                  step === 4 || step === 6 ? palette.nutrition : palette.workout,
                alignSelf: isRTL ? 'flex-end' : 'flex-start',
              },
            ]}
          />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom + 24, 32) },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ==================== STEP 1: BASIC DATA ==================== */}
        {step === 1 && (
          <View style={styles.stepBody}>
            <Text
              style={[
                styles.title,
                { color: palette.text, textAlign: isRTL ? 'right' : 'left' },
              ]}
            >
              {t('step1Title')}
            </Text>
            <Text
              style={[
                styles.subtitle,
                {
                  color: palette.textMuted,
                  textAlign: isRTL ? 'right' : 'left',
                },
              ]}
            >
              {t('step1Subtitle')}
            </Text>

            <Card style={styles.formCard}>
              <Text
                style={[
                  styles.fieldLabel,
                  { color: palette.text, textAlign: isRTL ? 'right' : 'left' },
                ]}
              >
                {t('nameLabel')}
              </Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder={t('namePlaceholder')}
                placeholderTextColor={palette.textSubtle}
                style={[
                  styles.input,
                  {
                    backgroundColor: palette.inputBg,
                    borderColor: palette.border,
                    color: palette.text,
                    textAlign: isRTL ? 'right' : 'left',
                  },
                ]}
              />

              <Text
                style={[
                  styles.fieldLabel,
                  { color: palette.text, textAlign: isRTL ? 'right' : 'left' },
                ]}
              >
                {t('genderLabel')}
              </Text>
              <View
                style={[
                  styles.segmentRow,
                  { flexDirection: isRTL ? 'row-reverse' : 'row' },
                ]}
              >
                {(['male', 'female'] as Gender[]).map((g) => {
                  const active = gender === g;
                  return (
                    <Pressable
                      key={g}
                      onPress={() => setGender(g)}
                      style={[
                        styles.segmentBtn,
                        {
                          backgroundColor: active
                            ? palette.workoutSoft
                            : palette.inputBg,
                          borderColor: active
                            ? palette.workout
                            : palette.border,
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
                        {t(g)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <View
                style={[
                  styles.twoCol,
                  { flexDirection: isRTL ? 'row-reverse' : 'row' },
                ]}
              >
                <View style={styles.colItem}>
                  <Text
                    style={[
                      styles.fieldLabel,
                      {
                        color: palette.text,
                        textAlign: isRTL ? 'right' : 'left',
                      },
                    ]}
                  >
                    {t('ageLabel')}
                  </Text>
                  <TextInput
                    value={ageStr}
                    onChangeText={setAgeStr}
                    keyboardType="number-pad"
                    style={[
                      styles.input,
                      {
                        backgroundColor: palette.inputBg,
                        borderColor: validationErrors.age
                          ? palette.danger
                          : palette.border,
                        color: palette.text,
                        textAlign: 'center',
                      },
                    ]}
                  />
                </View>

                <View style={styles.colItem}>
                  <Text
                    style={[
                      styles.fieldLabel,
                      {
                        color: palette.text,
                        textAlign: isRTL ? 'right' : 'left',
                      },
                    ]}
                  >
                    {t('heightLabel')}
                  </Text>
                  <TextInput
                    value={heightStr}
                    onChangeText={setHeightStr}
                    keyboardType="decimal-pad"
                    style={[
                      styles.input,
                      {
                        backgroundColor: palette.inputBg,
                        borderColor: validationErrors.heightCm
                          ? palette.danger
                          : palette.border,
                        color: palette.text,
                        textAlign: 'center',
                      },
                    ]}
                  />
                </View>
              </View>

              <View
                style={[
                  styles.twoCol,
                  { flexDirection: isRTL ? 'row-reverse' : 'row' },
                ]}
              >
                <View style={styles.colItem}>
                  <Text
                    style={[
                      styles.fieldLabel,
                      {
                        color: palette.text,
                        textAlign: isRTL ? 'right' : 'left',
                      },
                    ]}
                  >
                    {`${t('currentWeightLabel')} (${weightUnitLabel})`}
                  </Text>
                  <TextInput
                    value={weightStr}
                    onChangeText={setWeightStr}
                    keyboardType="decimal-pad"
                    style={[
                      styles.input,
                      {
                        backgroundColor: palette.inputBg,
                        borderColor: validationErrors.weightKg
                          ? palette.danger
                          : palette.border,
                        color: palette.text,
                        textAlign: 'center',
                      },
                    ]}
                  />
                </View>

                <View style={styles.colItem}>
                  <Text
                    style={[
                      styles.fieldLabel,
                      {
                        color: palette.text,
                        textAlign: isRTL ? 'right' : 'left',
                      },
                    ]}
                  >
                    {`${t('targetWeightLabel')} (${weightUnitLabel})`}
                  </Text>
                  <TextInput
                    value={targetWeightStr}
                    onChangeText={setTargetWeightStr}
                    keyboardType="decimal-pad"
                    style={[
                      styles.input,
                      {
                        backgroundColor: palette.inputBg,
                        borderColor: validationErrors.targetWeightKg
                          ? palette.danger
                          : palette.border,
                        color: palette.text,
                        textAlign: 'center',
                      },
                    ]}
                  />
                </View>
              </View>

              {Object.keys(validationErrors).length > 0 && (
                <View
                  style={[
                    styles.errorBox,
                    { backgroundColor: palette.dangerSoft },
                  ]}
                >
                  {validationErrors.age && (
                    <Text
                      style={[
                        styles.errorText,
                        {
                          color: palette.danger,
                          textAlign: isRTL ? 'right' : 'left',
                        },
                      ]}
                    >
                      {t('errInvalidAge')}
                    </Text>
                  )}
                  {validationErrors.heightCm && (
                    <Text
                      style={[
                        styles.errorText,
                        {
                          color: palette.danger,
                          textAlign: isRTL ? 'right' : 'left',
                        },
                      ]}
                    >
                      {t('errInvalidHeight')}
                    </Text>
                  )}
                  {validationErrors.weightKg && (
                    <Text
                      style={[
                        styles.errorText,
                        {
                          color: palette.danger,
                          textAlign: isRTL ? 'right' : 'left',
                        },
                      ]}
                    >
                      {t('errInvalidWeight')}
                    </Text>
                  )}
                  {validationErrors.targetWeightKg && (
                    <Text
                      style={[
                        styles.errorText,
                        {
                          color: palette.danger,
                          textAlign: isRTL ? 'right' : 'left',
                        },
                      ]}
                    >
                      {t('errInvalidTargetWeight')}
                    </Text>
                  )}
                </View>
              )}
            </Card>
          </View>
        )}

        {/* ==================== STEP 2: GOAL ==================== */}
        {step === 2 && (
          <View style={styles.stepBody}>
            <Text
              style={[
                styles.title,
                { color: palette.text, textAlign: isRTL ? 'right' : 'left' },
              ]}
            >
              {t('step2Title')}
            </Text>
            <Text
              style={[
                styles.subtitle,
                {
                  color: palette.textMuted,
                  textAlign: isRTL ? 'right' : 'left',
                },
              ]}
            >
              {t('step2Subtitle')}
            </Text>

            <View style={styles.optionList}>
              {(
                [
                  {
                    id: 'fat_loss',
                    title: t('goalFatLoss'),
                    desc: t('goalFatLossDesc'),
                  },
                  {
                    id: 'muscle_gain',
                    title: t('goalMuscleGain'),
                    desc: t('goalMuscleGainDesc'),
                  },
                  {
                    id: 'improve_fitness',
                    title: t('goalImproveFitness'),
                    desc: t('goalImproveFitnessDesc'),
                  },
                  {
                    id: 'maintain_weight',
                    title: t('goalMaintain'),
                    desc: t('goalMaintainDesc'),
                  },
                ] as { id: Goal; title: string; desc: string }[]
              ).map((item) => {
                const selected = goal === item.id;
                return (
                  <Pressable
                    key={item.id}
                    onPress={() => setGoal(item.id)}
                    style={[
                      styles.choiceCard,
                      {
                        backgroundColor: selected
                          ? palette.workoutSoft
                          : palette.card,
                        borderColor: selected ? palette.workout : palette.border,
                        flexDirection: isRTL ? 'row-reverse' : 'row',
                      },
                    ]}
                  >
                    <View style={styles.choiceTextWrap}>
                      <Text
                        style={[
                          styles.choiceTitle,
                          {
                            color: palette.text,
                            textAlign: isRTL ? 'right' : 'left',
                          },
                        ]}
                      >
                        {item.title}
                      </Text>
                      <Text
                        style={[
                          styles.choiceDesc,
                          {
                            color: palette.textMuted,
                            textAlign: isRTL ? 'right' : 'left',
                          },
                        ]}
                      >
                        {item.desc}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.checkCircle,
                        {
                          borderColor: selected
                            ? palette.workout
                            : palette.border,
                          backgroundColor: selected
                            ? palette.workout
                            : 'transparent',
                        },
                      ]}
                    >
                      {selected && <Check size={16} color="#FFFFFF" />}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {/* ==================== STEP 3: TRAINING SETUP ==================== */}
        {step === 3 && (
          <View style={styles.stepBody}>
            <Text
              style={[
                styles.title,
                { color: palette.text, textAlign: isRTL ? 'right' : 'left' },
              ]}
            >
              {t('step3Title')}
            </Text>
            <Text
              style={[
                styles.subtitle,
                {
                  color: palette.textMuted,
                  textAlign: isRTL ? 'right' : 'left',
                },
              ]}
            >
              {t('step3Subtitle')}
            </Text>

            <Card style={styles.formCard}>
              <Text
                style={[
                  styles.fieldLabel,
                  { color: palette.text, textAlign: isRTL ? 'right' : 'left' },
                ]}
              >
                {t('levelLabel')}
              </Text>
              <View
                style={[
                  styles.segmentRow,
                  { flexDirection: isRTL ? 'row-reverse' : 'row' },
                ]}
              >
                {(
                  ['beginner', 'intermediate', 'advanced'] as ExperienceLevel[]
                ).map((lvl) => {
                  const active = level === lvl;
                  return (
                    <Pressable
                      key={lvl}
                      onPress={() => setLevel(lvl)}
                      style={[
                        styles.segmentBtn,
                        {
                          backgroundColor: active
                            ? palette.workoutSoft
                            : palette.inputBg,
                          borderColor: active
                            ? palette.workout
                            : palette.border,
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
                        {t(lvl)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text
                style={[
                  styles.fieldLabel,
                  { color: palette.text, textAlign: isRTL ? 'right' : 'left' },
                ]}
              >
                {`${t('daysLabel')}: ${trainingDays} ${
                  trainingDays === 1 ? t('dayUnit') : t('daysUnit')
                }`}
              </Text>
              <View
                style={[
                  styles.daysRow,
                  { flexDirection: isRTL ? 'row-reverse' : 'row' },
                ]}
              >
                {[1, 2, 3, 4, 5, 6].map((dayNum) => {
                  const active = trainingDays === dayNum;
                  return (
                    <Pressable
                      key={dayNum}
                      onPress={() => setTrainingDays(dayNum)}
                      style={[
                        styles.dayButton,
                        {
                          backgroundColor: active
                            ? palette.workout
                            : palette.inputBg,
                          borderColor: active
                            ? palette.workout
                            : palette.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.dayButtonText,
                          { color: active ? '#FFFFFF' : palette.text },
                        ]}
                      >
                        {dayNum}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text
                style={[
                  styles.fieldLabel,
                  { color: palette.text, textAlign: isRTL ? 'right' : 'left' },
                ]}
              >
                {t('placeLabel')}
              </Text>
              <View style={styles.optionList}>
                {(
                  [
                    {
                      id: 'gym',
                      label: t('gym'),
                      icon: (c: string) => <Dumbbell size={20} color={c} />,
                    },
                    {
                      id: 'home',
                      label: t('home'),
                      icon: (c: string) => <HomeIcon size={20} color={c} />,
                    },
                  ] as {
                    id: TrainingPlace;
                    label: string;
                    icon: (c: string) => React.ReactNode;
                  }[]
                ).map((item) => {
                  const active = place === item.id;
                  return (
                    <Pressable
                      key={item.id}
                      onPress={() => setPlace(item.id)}
                      style={[
                        styles.placeOption,
                        {
                          backgroundColor: active
                            ? palette.workoutSoft
                            : palette.inputBg,
                          borderColor: active
                            ? palette.workout
                            : palette.border,
                          flexDirection: isRTL ? 'row-reverse' : 'row',
                        },
                      ]}
                    >
                      {item.icon(active ? palette.workout : palette.textMuted)}
                      <Text
                        style={[
                          styles.segmentText,
                          {
                            color: active ? palette.workout : palette.text,
                            fontFamily: active ? FONTS.bold : FONTS.semiBold,
                          },
                        ]}
                      >
                        {item.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </Card>
          </View>
        )}

        {/* ==================== STEP 4: DIET & ALLERGIES ==================== */}
        {step === 4 && (
          <View style={styles.stepBody}>
            <Text
              style={[
                styles.title,
                { color: palette.text, textAlign: isRTL ? 'right' : 'left' },
              ]}
            >
              {t('step4Title')}
            </Text>
            <Text
              style={[
                styles.subtitle,
                {
                  color: palette.textMuted,
                  textAlign: isRTL ? 'right' : 'left',
                },
              ]}
            >
              {t('step4Subtitle')}
            </Text>

            <Card style={styles.formCard}>
              <Text
                style={[
                  styles.fieldLabel,
                  { color: palette.text, textAlign: isRTL ? 'right' : 'left' },
                ]}
              >
                {t('dietLabel')}
              </Text>
              <View style={styles.optionList}>
                {(
                  [
                    { id: 'regular', label: t('dietRegular') },
                    { id: 'vegetarian', label: t('dietVegetarian') },
                    { id: 'keto', label: t('dietKeto') },
                    { id: 'lactose_free', label: t('dietLactoseFree') },
                  ] as { id: DietPreference; label: string }[]
                ).map((d) => {
                  const active = diet === d.id;
                  return (
                    <Pressable
                      key={d.id}
                      onPress={() => setDiet(d.id)}
                      style={[
                        styles.placeOption,
                        {
                          backgroundColor: active
                            ? palette.nutritionSoft
                            : palette.inputBg,
                          borderColor: active
                            ? palette.nutrition
                            : palette.border,
                          flexDirection: isRTL ? 'row-reverse' : 'row',
                          justifyContent: 'space-between',
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
                        {d.label}
                      </Text>
                      {active && <Check size={18} color={palette.nutrition} />}
                    </Pressable>
                  );
                })}
              </View>

              <Text
                style={[
                  styles.fieldLabel,
                  {
                    color: palette.text,
                    textAlign: isRTL ? 'right' : 'left',
                    marginTop: 8,
                  },
                ]}
              >
                {t('allergiesLabel')}
              </Text>
              <View
                style={[
                  styles.allergyGrid,
                  { flexDirection: isRTL ? 'row-reverse' : 'row' },
                ]}
              >
                {ALLERGY_OPTIONS.map((a) => {
                  const active = allergies.includes(a);
                  const labelKey = (
                    a === 'dairy'
                      ? 'allergyDairy'
                      : a === 'nuts'
                      ? 'allergyNuts'
                      : a === 'gluten'
                      ? 'allergyGluten'
                      : a === 'eggs'
                      ? 'allergyEggs'
                      : a === 'seafood'
                      ? 'allergySeafood'
                      : 'allergySoy'
                  ) as Parameters<typeof t>[0];

                  return (
                    <Pressable
                      key={a}
                      onPress={() => toggleAllergy(a)}
                      style={[
                        styles.allergyBtn,
                        {
                          backgroundColor: active
                            ? palette.workoutSoft
                            : palette.inputBg,
                          borderColor: active
                            ? palette.workout
                            : palette.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.allergyText,
                          {
                            color: active ? palette.workout : palette.textMuted,
                            fontFamily: active ? FONTS.bold : FONTS.semiBold,
                          },
                        ]}
                      >
                        {t(labelKey)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </Card>
          </View>
        )}

        {/* ==================== STEP 5: GENERATING PLAN ==================== */}
        {step === 5 && (
          <View style={styles.generatingContainer}>
            <Animated.View
              style={[
                styles.spinnerWrap,
                { transform: [{ rotate: spinRotate }] },
              ]}
            >
              <Svg width={128} height={128}>
                <Circle
                  cx={64}
                  cy={64}
                  r={54}
                  stroke={palette.border}
                  strokeWidth={10}
                  fill="none"
                />
                <Circle
                  cx={64}
                  cy={64}
                  r={54}
                  stroke={palette.workout}
                  strokeWidth={10}
                  strokeDasharray="110 240"
                  strokeLinecap="round"
                  fill="none"
                />
              </Svg>
            </Animated.View>

            <Sparkles
              size={28}
              color={palette.nutrition}
              style={{ marginTop: -82, marginBottom: 46 }}
            />

            <Text style={[styles.genTitle, { color: palette.text }]}>
              {t('step5Title')}
            </Text>

            <Card style={styles.genStagesCard}>
              {[
                t('step5Stage1'),
                t('step5Stage2'),
                t('step5Stage3'),
                t('step5Stage4'),
              ].map((stageLabel, idx) => {
                const done = genStage > idx;
                const active = genStage === idx;
                return (
                  <View
                    key={stageLabel}
                    style={[
                      styles.genStageRow,
                      { flexDirection: isRTL ? 'row-reverse' : 'row' },
                    ]}
                  >
                    <View
                      style={[
                        styles.stageIndicator,
                        {
                          backgroundColor: done
                            ? palette.nutrition
                            : active
                            ? palette.workout
                            : palette.cardElevated,
                        },
                      ]}
                    >
                      {done && <Check size={14} color="#09150E" />}
                    </View>
                    <Text
                      style={[
                        styles.stageText,
                        {
                          color:
                            done || active ? palette.text : palette.textSubtle,
                          textAlign: isRTL ? 'right' : 'left',
                        },
                      ]}
                    >
                      {stageLabel}
                    </Text>
                  </View>
                );
              })}
            </Card>
          </View>
        )}

        {/* ==================== STEP 6: PLAN SUMMARY ==================== */}
        {step === 6 && previewPlan && (
          <View style={styles.stepBody}>
            <Text
              style={[
                styles.title,
                { color: palette.text, textAlign: isRTL ? 'right' : 'left' },
              ]}
            >
              {t('step6Title')}
            </Text>
            <Text
              style={[
                styles.subtitle,
                {
                  color: palette.textMuted,
                  textAlign: isRTL ? 'right' : 'left',
                },
              ]}
            >
              {t('step6Subtitle')}
            </Text>

            {/* Safety & Target Adjustment Notices */}
            {previewPlan.plan.safetyNotices.isUnder18 && (
              <View
                style={[
                  styles.noticeBox,
                  {
                    backgroundColor: palette.warningSoft,
                    borderColor: palette.warning,
                    flexDirection: isRTL ? 'row-reverse' : 'row',
                  },
                ]}
              >
                <AlertTriangle size={20} color={palette.warning} />
                <Text
                  style={[
                    styles.noticeText,
                    {
                      color: palette.text,
                      textAlign: isRTL ? 'right' : 'left',
                    },
                  ]}
                >
                  {t('under18Note')}
                </Text>
              </View>
            )}

            {previewPlan.plan.safetyNotices.targetAdjusted && (
              <View
                style={[
                  styles.noticeBox,
                  {
                    backgroundColor: palette.waterSoft,
                    borderColor: palette.water,
                    flexDirection: isRTL ? 'row-reverse' : 'row',
                  },
                ]}
              >
                <Info size={20} color={palette.water} />
                <Text
                  style={[
                    styles.noticeText,
                    {
                      color: palette.text,
                      textAlign: isRTL ? 'right' : 'left',
                    },
                  ]}
                >
                  {t('targetAdjustedNote', {
                    weight: formatWeight(
                      previewPlan.plan.safetyNotices.adjustedTargetWeightKg,
                      settings.unit,
                      settings.language
                    ),
                  })}
                </Text>
              </View>
            )}

            {(previewPlan.plan.safetyNotices.calorieFloorApplied ||
              previewPlan.plan.safetyNotices.deficitCapped) && (
              <View
                style={[
                  styles.noticeBox,
                  {
                    backgroundColor: palette.nutritionSoft,
                    borderColor: palette.nutrition,
                    flexDirection: isRTL ? 'row-reverse' : 'row',
                  },
                ]}
              >
                <Info size={20} color={palette.nutrition} />
                <Text
                  style={[
                    styles.noticeText,
                    {
                      color: palette.text,
                      textAlign: isRTL ? 'right' : 'left',
                    },
                  ]}
                >
                  {previewPlan.plan.safetyNotices.calorieFloorApplied
                    ? t('calorieFloorNote', {
                        calories: previewPlan.plan.targetCalories,
                      })
                    : t('deficitCappedNote')}
                </Text>
              </View>
            )}

            {/* Calories, Macros & Water Card */}
            <Card>
              <View
                style={[
                  styles.summaryHeroRow,
                  { flexDirection: isRTL ? 'row-reverse' : 'row' },
                ]}
              >
                <View style={styles.summaryMetric}>
                  <Flame size={20} color={palette.workout} />
                  <Text style={[styles.summaryBigNum, { color: palette.text }]}>
                    {previewPlan.plan.targetCalories}
                  </Text>
                  <Text
                    style={[
                      styles.summaryLabel,
                      { color: palette.textMuted },
                    ]}
                  >
                    {`${t('dailyCaloriesLabel')} (${t('kcal')})`}
                  </Text>
                </View>

                <View
                  style={[
                    styles.verticalDivider,
                    { backgroundColor: palette.border },
                  ]}
                />

                <View style={styles.summaryMetric}>
                  <Droplets size={20} color={palette.water} />
                  <Text style={[styles.summaryBigNum, { color: palette.text }]}>
                    {previewPlan.plan.waterGoalMl}
                  </Text>
                  <Text
                    style={[
                      styles.summaryLabel,
                      { color: palette.textMuted },
                    ]}
                  >
                    {`${t('waterGoalLabel')} (${t('ml')})`}
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.macrosGrid,
                  {
                    borderTopColor: palette.border,
                    flexDirection: isRTL ? 'row-reverse' : 'row',
                  },
                ]}
              >
                {[
                  {
                    label: t('protein'),
                    val: previewPlan.plan.macros.proteinG,
                    color: palette.workout,
                  },
                  {
                    label: t('carbs'),
                    val: previewPlan.plan.macros.carbsG,
                    color: palette.nutrition,
                  },
                  {
                    label: t('fat'),
                    val: previewPlan.plan.macros.fatG,
                    color: palette.water,
                  },
                ].map((m) => (
                  <View key={m.label} style={styles.macroPill}>
                    <Text style={[styles.macroNum, { color: m.color }]}>
                      {`${m.val}${t('gram')}`}
                    </Text>
                    <Text
                      style={[
                        styles.macroTitle,
                        { color: palette.textMuted },
                      ]}
                    >
                      {m.label}
                    </Text>
                  </View>
                ))}
              </View>
            </Card>

            {/* Weekly Workout Schedule Card */}
            <Card>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: palette.text, textAlign: isRTL ? 'right' : 'left' },
                ]}
              >
                {t('weeklySplitLabel')}
              </Text>
              <View style={styles.scheduleList}>
                {previewPlan.plan.weeklySchedule.map((day) => {
                  const dayTitle =
                    settings.language === 'ar' ? day.titleAr : day.titleEn;
                  return (
                    <View
                      key={day.dayIndex}
                      style={[
                        styles.scheduleRow,
                        {
                          borderBottomColor: palette.border,
                          flexDirection: isRTL ? 'row-reverse' : 'row',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.scheduleDayName,
                          {
                            color: day.isRestDay
                              ? palette.textSubtle
                              : palette.workout,
                          },
                        ]}
                      >
                        {daysShort[day.dayIndex]}
                      </Text>
                      <Text
                        numberOfLines={1}
                        style={[
                          styles.scheduleFocus,
                          {
                            color: day.isRestDay
                              ? palette.textMuted
                              : palette.text,
                            textAlign: isRTL ? 'right' : 'left',
                          },
                        ]}
                      >
                        {dayTitle}
                      </Text>
                      {!day.isRestDay && (
                        <Text
                          style={[
                            styles.scheduleMeta,
                            { color: palette.textMuted },
                          ]}
                        >
                          {t('exercisesCount', { count: day.exercises.length })}
                        </Text>
                      )}
                    </View>
                  );
                })}
              </View>
            </Card>

            {/* General Medical Disclaimer */}
            <Text style={[styles.disclaimer, { color: palette.textSubtle }]}>
              {t('medicalDisclaimer')}
            </Text>
          </View>
        )}

        {/* Action CTA Footer */}
        {step < 5 && (
          <View style={styles.footerActions}>
            <Button label={t('continueBtn')} onPress={handleNext} />
          </View>
        )}

        {step === 6 && previewPlan && (
          <View style={styles.footerActions}>
            <Button
              label={t('startJourneyBtn')}
              variant="nutrition"
              onPress={handleStartJourney}
            />
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 12,
  },
  headerRow: {
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconSpacer: {
    width: 44,
    height: 44,
  },
  stepCounter: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
  },
  langToggle: {
    minWidth: 44,
    height: 44,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  langToggleText: {
    fontFamily: FONTS.bold,
    fontSize: 13,
  },
  progressTrack: {
    height: 6,
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    gap: 18,
  },
  stepBody: {
    gap: 14,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 25,
    lineHeight: 34,
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 4,
  },
  formCard: {
    gap: 12,
  },
  fieldLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
  },
  input: {
    height: 48,
    borderRadius: RADIUS.input,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontFamily: FONTS.semiBold,
    fontSize: 16,
  },
  segmentRow: {
    gap: 10,
  },
  segmentBtn: {
    flex: 1,
    minHeight: 48,
    borderRadius: RADIUS.input,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  segmentText: {
    fontSize: 14,
  },
  twoCol: {
    gap: 12,
  },
  colItem: {
    flex: 1,
    gap: 6,
  },
  errorBox: {
    borderRadius: RADIUS.input,
    padding: 12,
    gap: 4,
  },
  errorText: {
    fontFamily: FONTS.semiBold,
    fontSize: 13,
  },
  optionList: {
    gap: 10,
  },
  choiceCard: {
    borderRadius: RADIUS.card,
    borderWidth: 1.5,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  choiceTextWrap: {
    flex: 1,
    gap: 3,
  },
  choiceTitle: {
    fontFamily: FONTS.bold,
    fontSize: 16,
  },
  choiceDesc: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    lineHeight: 19,
  },
  checkCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  daysRow: {
    gap: 8,
  },
  dayButton: {
    flex: 1,
    height: 48,
    borderRadius: RADIUS.input,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayButtonText: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    fontVariant: ['tabular-nums'],
  },
  placeOption: {
    minHeight: 50,
    borderRadius: RADIUS.input,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    alignItems: 'center',
    gap: 10,
  },
  allergyGrid: {
    flexWrap: 'wrap',
    gap: 10,
  },
  allergyBtn: {
    minHeight: 44,
    paddingHorizontal: 16,
    borderRadius: RADIUS.input,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  allergyText: {
    fontSize: 14,
  },
  generatingContainer: {
    paddingTop: 40,
    alignItems: 'center',
    gap: 16,
  },
  spinnerWrap: {
    width: 128,
    height: 128,
    alignItems: 'center',
    justifyContent: 'center',
  },
  genTitle: {
    fontFamily: FONTS.bold,
    fontSize: 21,
    textAlign: 'center',
  },
  genStagesCard: {
    width: '100%',
    gap: 14,
    marginTop: 8,
  },
  genStageRow: {
    alignItems: 'center',
    gap: 12,
  },
  stageIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stageText: {
    flex: 1,
    fontFamily: FONTS.semiBold,
    fontSize: 14,
  },
  noticeBox: {
    borderRadius: RADIUS.card,
    borderWidth: 1,
    padding: 14,
    alignItems: 'center',
    gap: 10,
  },
  noticeText: {
    flex: 1,
    fontFamily: FONTS.semiBold,
    fontSize: 13,
    lineHeight: 20,
  },
  summaryHeroRow: {
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: 14,
  },
  summaryMetric: {
    alignItems: 'center',
    gap: 4,
  },
  summaryBigNum: {
    fontFamily: FONTS.bold,
    fontSize: 28,
    fontVariant: ['tabular-nums'],
  },
  summaryLabel: {
    fontFamily: FONTS.regular,
    fontSize: 12,
  },
  verticalDivider: {
    width: 1,
    height: 54,
  },
  macrosGrid: {
    borderTopWidth: 1,
    paddingTop: 14,
    justifyContent: 'space-around',
  },
  macroPill: {
    alignItems: 'center',
    gap: 2,
  },
  macroNum: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    fontVariant: ['tabular-nums'],
  },
  macroTitle: {
    fontFamily: FONTS.regular,
    fontSize: 12,
  },
  sectionTitle: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    marginBottom: 10,
  },
  scheduleList: {
    gap: 2,
  },
  scheduleRow: {
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  scheduleDayName: {
    width: 52,
    fontFamily: FONTS.bold,
    fontSize: 13,
  },
  scheduleFocus: {
    flex: 1,
    fontFamily: FONTS.semiBold,
    fontSize: 14,
  },
  scheduleMeta: {
    fontFamily: FONTS.regular,
    fontSize: 12,
  },
  disclaimer: {
    fontFamily: FONTS.regular,
    fontSize: 12.5,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  footerActions: {
    marginTop: 8,
  },
});
