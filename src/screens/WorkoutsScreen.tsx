import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
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
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Dumbbell,
  Flame,
  RotateCcw,
  Sparkles,
} from 'lucide-react-native';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { ExerciseImage } from '../components/ExerciseImage';
import { useCoach } from '../context/CoachContext';
import { getExerciseById } from '../data/exercises';
import { FONTS, RADIUS } from '../theme/tokens';
import {
  AiGenerateFailureReason,
  MuscleGroup,
  PlannedExercise,
} from '../types/coach';
import { containsPainKeywords } from '../utils/aiProgram';

type WorkoutView = 'week' | 'day' | 'exercise';

function getMuscleLabelKey(muscle: MuscleGroup) {
  switch (muscle) {
    case 'chest':
      return 'muscleChest' as const;
    case 'back':
      return 'muscleBack' as const;
    case 'shoulders':
      return 'muscleShoulders' as const;
    case 'legs':
      return 'muscleLegs' as const;
    case 'arms':
      return 'muscleArms' as const;
    case 'core':
      return 'muscleCore' as const;
    case 'cardio':
      return 'muscleCardio' as const;
  }
}

function getFailureTranslationKey(reason: AiGenerateFailureReason) {
  switch (reason) {
    case 'no_key':
      return 'aiErrNoKey' as const;
    case 'auth':
      return 'aiErrAuth' as const;
    case 'model_not_found':
      return 'aiErrModelNotFound' as const;
    case 'quota':
      return 'aiErrQuota' as const;
    case 'network':
      return 'aiErrNetwork' as const;
    case 'invalid_response':
      return 'aiErrInvalidResponse' as const;
  }
}

function formatCreatedDate(isoString: string, language: 'ar' | 'en'): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    return isoString.slice(0, 10);
  }
  try {
    return date.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return isoString.slice(0, 10);
  }
}

export function WorkoutsScreen() {
  const {
    palette,
    isRTL,
    settings,
    profile,
    plan,
    aiProgram,
    activeSchedule,
    dailyLog,
    t,
    daysShort,
    generateAiProgram,
    clearAiProgram,
  } = useCoach();
  const insets = useSafeAreaInsets();

  const [view, setView] = useState<WorkoutView>('week');
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(() =>
    new Date().getDay()
  );
  const [selectedPlannedExercise, setSelectedPlannedExercise] =
    useState<PlannedExercise | null>(null);

  const [isAiExpanded, setIsAiExpanded] = useState(false);
  const [notes, setNotes] = useState(aiProgram?.userNotes ?? '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [confirmResetVisible, setConfirmResetVisible] = useState(false);

  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (view === 'exercise') {
          setView('day');
          return true;
        }
        if (view === 'day') {
          setView('week');
          return true;
        }
        return false;
      }
    );
    return () => subscription.remove();
  }, [view]);

  if (!plan || !profile || activeSchedule.length === 0) {
    return null;
  }

  const todayIndex = new Date().getDay();
  const selectedDay =
    activeSchedule.find((d) => d.dayIndex === selectedDayIndex) ??
    activeSchedule[0];

  const handleGenerateAi = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    setStatusMessage(null);
    setConfirmResetVisible(false);
    try {
      const result = await generateAiProgram(notes);
      if (result.ok) {
        setStatusMessage({ type: 'success', text: t('aiSuccessMsg') });
        setIsAiExpanded(false);
      } else {
        setStatusMessage({
          type: 'error',
          text: t(getFailureTranslationKey(result.reason)),
        });
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleConfirmBackToAuto = async () => {
    setConfirmResetVisible(false);
    setStatusMessage(null);
    await clearAiProgram();
  };

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;
  const ForwardIcon = isRTL ? ChevronLeft : ChevronRight;

  // ==================== EXERCISE DETAIL VIEW ====================
  const selectedExercise = selectedPlannedExercise
    ? getExerciseById(selectedPlannedExercise.exerciseId)
    : undefined;

  if (view === 'exercise' && selectedPlannedExercise && selectedExercise) {
    const exercise = selectedExercise;

    const exerciseName =
      settings.language === 'ar' ? exercise.nameAr : exercise.nameEn;

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
        <Pressable
          onPress={() => setView('day')}
          style={({ pressed }) => [
            styles.backRow,
            {
              flexDirection: isRTL ? 'row-reverse' : 'row',
              opacity: pressed ? 0.7 : 1,
            },
          ]}
          accessibilityRole="button"
        >
          <BackIcon size={20} color={palette.text} />
          <Text style={[styles.backText, { color: palette.text }]}>
            {t('backBtn')}
          </Text>
        </Pressable>

        <ExerciseImage
          exerciseId={exercise.id}
          aspectRatio={16 / 10}
          rounded={RADIUS.card}
        />

        <Text
          style={[
            styles.exerciseDetailTitle,
            { color: palette.text, textAlign: isRTL ? 'right' : 'left' },
          ]}
        >
          {exerciseName}
        </Text>

        {/* Muscle, Level & Place Cards */}
        <View
          style={[
            styles.metaGrid,
            { flexDirection: isRTL ? 'row-reverse' : 'row' },
          ]}
        >
          <Card style={styles.metaTile}>
            <Text style={[styles.metaTileLabel, { color: palette.textMuted }]}>
              {t(getMuscleLabelKey(exercise.muscle))}
            </Text>
            <Text style={[styles.metaTileSub, { color: palette.workout }]}>
              {daysShort[selectedDay.dayIndex]}
            </Text>
          </Card>

          <Card style={styles.metaTile}>
            <Text style={[styles.metaTileLabel, { color: palette.textMuted }]}>
              {t('levelCardLabel')}
            </Text>
            <Text style={[styles.metaTileValue, { color: palette.text }]}>
              {t(exercise.level)}
            </Text>
          </Card>

          <Card style={styles.metaTile}>
            <Text style={[styles.metaTileLabel, { color: palette.textMuted }]}>
              {t('placeCardLabel')}
            </Text>
            <Text style={[styles.metaTileValue, { color: palette.text }]}>
              {exercise.place === 'gym' ? t('placeGym') : t('placeHome')}
            </Text>
          </Card>
        </View>

        {/* Prescription Card */}
        <Card style={styles.prescriptionCard}>
          <Text
            style={[
              styles.cardHeading,
              { color: palette.text, textAlign: isRTL ? 'right' : 'left' },
            ]}
          >
            {t('prescriptionTitle')}
          </Text>

          <View
            style={[
              styles.prescriptionRow,
              { flexDirection: isRTL ? 'row-reverse' : 'row' },
            ]}
          >
            <View style={styles.prescriptionBox}>
              <Text style={[styles.rxValue, { color: palette.workout }]}>
                {selectedPlannedExercise.sets}
              </Text>
              <Text style={[styles.rxLabel, { color: palette.textMuted }]}>
                {t('setsLabel')}
              </Text>
            </View>

            <View
              style={[styles.rxDivider, { backgroundColor: palette.border }]}
            />

            <View style={styles.prescriptionBox}>
              <Text style={[styles.rxValue, { color: palette.text }]}>
                {selectedPlannedExercise.reps}
              </Text>
              <Text style={[styles.rxLabel, { color: palette.textMuted }]}>
                {t('repsLabel')}
              </Text>
            </View>

            <View
              style={[styles.rxDivider, { backgroundColor: palette.border }]}
            />

            <View style={styles.prescriptionBox}>
              <Text style={[styles.rxValue, { color: palette.water }]}>
                {`${selectedPlannedExercise.restSeconds}${t('sec')}`}
              </Text>
              <Text style={[styles.rxLabel, { color: palette.textMuted }]}>
                {t('restLabel')}
              </Text>
            </View>
          </View>
        </Card>

        <Card elevated>
          <Text
            style={[
              styles.comingSoonNote,
              { color: palette.textMuted, textAlign: isRTL ? 'right' : 'left' },
            ]}
          >
            {t('exerciseComingSoonNote')}
          </Text>
        </Card>
      </ScrollView>
    );
  }

  // ==================== DAY VIEW ====================
  if (view === 'day' && selectedDay) {
    const dayTitle =
      settings.language === 'ar' ? selectedDay.titleAr : selectedDay.titleEn;
    const finisherText =
      settings.language === 'ar'
        ? selectedDay.cardioFinisherAr
        : selectedDay.cardioFinisherEn;

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
        <Pressable
          onPress={() => setView('week')}
          style={({ pressed }) => [
            styles.backRow,
            {
              flexDirection: isRTL ? 'row-reverse' : 'row',
              opacity: pressed ? 0.7 : 1,
            },
          ]}
          accessibilityRole="button"
        >
          <BackIcon size={20} color={palette.text} />
          <Text style={[styles.backText, { color: palette.text }]}>
            {t('backBtn')}
          </Text>
        </Pressable>

        <View style={styles.dayHeaderBlock}>
          <Text
            style={[
              styles.dayEyebrow,
              { color: palette.workout, textAlign: isRTL ? 'right' : 'left' },
            ]}
          >
            {daysShort[selectedDay.dayIndex]}
          </Text>
          <Text
            style={[
              styles.pageTitle,
              { color: palette.text, textAlign: isRTL ? 'right' : 'left' },
            ]}
          >
            {dayTitle}
          </Text>
          <Text
            style={[
              styles.daySummaryMeta,
              { color: palette.textMuted, textAlign: isRTL ? 'right' : 'left' },
            ]}
          >
            {t('exercisesMinutesMeta', {
              count: selectedDay.exercises.length,
              minutes: selectedDay.estimatedMinutes,
            })}
          </Text>
        </View>

        {Boolean(finisherText) && (
          <Card
            style={[
              styles.finisherCard,
              {
                backgroundColor: palette.workoutSoft,
                borderColor: palette.workout,
              },
            ]}
          >
            <View
              style={[
                styles.finisherRow,
                { flexDirection: isRTL ? 'row-reverse' : 'row' },
              ]}
            >
              <Flame size={18} color={palette.workout} />
              <Text
                style={[
                  styles.finisherText,
                  { color: palette.text, textAlign: isRTL ? 'right' : 'left' },
                ]}
              >
                {finisherText}
              </Text>
            </View>
          </Card>
        )}

        <View style={styles.listGap}>
          {selectedDay.exercises.map((item) => {
            const exercise = getExerciseById(item.exerciseId);
            if (!exercise) return null;

            const name =
              settings.language === 'ar' ? exercise.nameAr : exercise.nameEn;

            return (
              <Pressable
                key={item.exerciseId}
                onPress={() => {
                  setSelectedPlannedExercise(item);
                  setView('exercise');
                }}
                style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
                accessibilityRole="button"
              >
                <Card style={styles.exerciseCard}>
                  <View
                    style={[
                      styles.exerciseCardRow,
                      { flexDirection: isRTL ? 'row-reverse' : 'row' },
                    ]}
                  >
                    <ExerciseImage
                      exerciseId={exercise.id}
                      size={72}
                      rounded={12}
                    />

                    <View style={styles.exerciseInfoCol}>
                      <Text
                        numberOfLines={2}
                        style={[
                          styles.exerciseCardTitle,
                          {
                            color: palette.text,
                            textAlign: isRTL ? 'right' : 'left',
                          },
                        ]}
                      >
                        {name}
                      </Text>

                      <Text
                        style={[
                          styles.exerciseMuscle,
                          {
                            color: palette.textMuted,
                            textAlign: isRTL ? 'right' : 'left',
                          },
                        ]}
                      >
                        {t(getMuscleLabelKey(exercise.muscle))}
                      </Text>

                      <View
                        style={[
                          styles.rxInlineRow,
                          { flexDirection: isRTL ? 'row-reverse' : 'row' },
                        ]}
                      >
                        <Text
                          style={[
                            styles.rxProminent,
                            { color: palette.workout },
                          ]}
                        >
                          {`${item.sets} × ${item.reps}`}
                        </Text>
                        <Text
                          style={[
                            styles.rxRestText,
                            { color: palette.textSubtle },
                          ]}
                        >
                          {t('restSecsLabel', { seconds: item.restSeconds })}
                        </Text>
                      </View>
                    </View>

                    <ForwardIcon size={18} color={palette.textSubtle} />
                  </View>
                </Card>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    );
  }

  // ==================== WEEK VIEW (DEFAULT) ====================
  const showPainBanner =
    containsPainKeywords(notes) || Boolean(aiProgram?.safetyNote);
  const createdDateFormatted = formatCreatedDate(
    aiProgram?.createdAt ?? plan.generatedAt,
    settings.language
  );

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
        {t('workoutsTitle')}
      </Text>

      {/* Program Header Card */}
      <Card style={styles.headerCard}>
        <View
          style={[
            styles.programHeaderTop,
            { flexDirection: isRTL ? 'row-reverse' : 'row' },
          ]}
        >
          <View
            style={[
              styles.programIconBox,
              {
                backgroundColor: aiProgram
                  ? palette.waterSoft
                  : palette.workoutSoft,
              },
            ]}
          >
            {aiProgram ? (
              <Sparkles size={18} color={palette.water} />
            ) : (
              <Dumbbell size={18} color={palette.workout} />
            )}
          </View>

          <View style={styles.programHeaderInfo}>
            <Text
              style={[
                styles.programTypeLabel,
                {
                  color: aiProgram ? palette.water : palette.workout,
                  textAlign: isRTL ? 'right' : 'left',
                },
              ]}
            >
              {aiProgram ? t('aiProgramBadge') : t('autoProgramBadge')}
            </Text>
            <Text
              style={[
                styles.programMetaLine,
                {
                  color: palette.textMuted,
                  textAlign: isRTL ? 'right' : 'left',
                },
              ]}
            >
              {t('createdOn', { date: createdDateFormatted })}
            </Text>
            {aiProgram && (
              <Text
                style={[
                  styles.programMetaLine,
                  {
                    color: palette.textSubtle,
                    textAlign: isRTL ? 'right' : 'left',
                  },
                ]}
              >
                {t('modelLabel', { model: aiProgram.model })}
              </Text>
            )}
          </View>
        </View>

        {aiProgram && (
          <View style={styles.aiHeaderActions}>
            <View
              style={[
                styles.aiActionButtonsRow,
                { flexDirection: isRTL ? 'row-reverse' : 'row' },
              ]}
            >
              <Pressable
                onPress={() => {
                  setIsAiExpanded(true);
                  setConfirmResetVisible(false);
                }}
                style={({ pressed }) => [
                  styles.compactActionBtn,
                  {
                    backgroundColor: palette.waterSoft,
                    borderColor: palette.water,
                    opacity: pressed ? 0.8 : 1,
                    flexDirection: isRTL ? 'row-reverse' : 'row',
                  },
                ]}
                accessibilityRole="button"
              >
                <Sparkles size={15} color={palette.water} />
                <Text
                  style={[styles.compactActionText, { color: palette.water }]}
                >
                  {t('regenerateAiBtn')}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setConfirmResetVisible((prev) => !prev)}
                style={({ pressed }) => [
                  styles.compactActionBtn,
                  {
                    backgroundColor: palette.cardElevated,
                    borderColor: palette.border,
                    opacity: pressed ? 0.8 : 1,
                    flexDirection: isRTL ? 'row-reverse' : 'row',
                  },
                ]}
                accessibilityRole="button"
              >
                <RotateCcw size={15} color={palette.textMuted} />
                <Text
                  style={[styles.compactActionText, { color: palette.text }]}
                >
                  {t('backToAutoBtn')}
                </Text>
              </Pressable>
            </View>

            {confirmResetVisible && (
              <View
                style={[
                  styles.confirmBox,
                  {
                    backgroundColor: palette.dangerSoft,
                    borderColor: palette.danger,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.confirmTitle,
                    {
                      color: palette.danger,
                      textAlign: isRTL ? 'right' : 'left',
                    },
                  ]}
                >
                  {t('confirmBackToAutoTitle')}
                </Text>
                <Text
                  style={[
                    styles.confirmDesc,
                    {
                      color: palette.text,
                      textAlign: isRTL ? 'right' : 'left',
                    },
                  ]}
                >
                  {t('confirmBackToAutoMsg')}
                </Text>
                <View
                  style={[
                    styles.confirmBtnRow,
                    { flexDirection: isRTL ? 'row-reverse' : 'row' },
                  ]}
                >
                  <Pressable
                    onPress={() => {
                      void handleConfirmBackToAuto();
                    }}
                    style={[
                      styles.confirmActionBtn,
                      { backgroundColor: palette.danger },
                    ]}
                  >
                    <Text style={styles.confirmActionTextLight}>
                      {t('confirmBtn')}
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setConfirmResetVisible(false)}
                    style={[
                      styles.confirmActionBtn,
                      {
                        backgroundColor: palette.cardElevated,
                        borderColor: palette.border,
                        borderWidth: 1,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.confirmActionTextDark,
                        { color: palette.text },
                      ]}
                    >
                      {t('cancelBtn')}
                    </Text>
                  </Pressable>
                </View>
              </View>
            )}
          </View>
        )}
      </Card>

      {/* Collapsible AI Generator Card */}
      <Card style={styles.generatorCard}>
        <Pressable
          onPress={() => setIsAiExpanded((prev) => !prev)}
          style={[
            styles.generatorHeader,
            { flexDirection: isRTL ? 'row-reverse' : 'row' },
          ]}
          accessibilityRole="button"
        >
          <View
            style={[
              styles.generatorTitleRow,
              { flexDirection: isRTL ? 'row-reverse' : 'row' },
            ]}
          >
            <Sparkles size={18} color={palette.workout} />
            <Text style={[styles.cardHeading, { color: palette.text }]}>
              {t('aiGeneratorTitle')}
            </Text>
          </View>
          {isAiExpanded ? (
            <ChevronUp size={20} color={palette.textMuted} />
          ) : (
            <ChevronDown size={20} color={palette.textMuted} />
          )}
        </Pressable>

        {isAiExpanded && (
          <View style={styles.generatorBody}>
            <Text
              style={[
                styles.notesLabel,
                { color: palette.text, textAlign: isRTL ? 'right' : 'left' },
              ]}
            >
              {t('aiNotesLabel')}
            </Text>
            <TextInput
              value={notes}
              onChangeText={(text) => setNotes(text.slice(0, 300))}
              maxLength={300}
              multiline
              numberOfLines={3}
              placeholder={t('aiNotesPlaceholder')}
              placeholderTextColor={palette.textSubtle}
              style={[
                styles.notesInput,
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
                styles.privacyLine,
                {
                  color: palette.textMuted,
                  textAlign: isRTL ? 'right' : 'left',
                },
              ]}
            >
              {t('aiPrivacyNote')}
            </Text>

            <Button
              label={
                isGenerating ? t('generatingAiBtn') : t('generateWithAiBtn')
              }
              variant="workout"
              onPress={() => {
                void handleGenerateAi();
              }}
              disabled={isGenerating}
              icon={
                isGenerating ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Sparkles size={18} color="#FFFFFF" />
                )
              }
            />
          </View>
        )}

        {statusMessage && (
          <Text
            style={[
              styles.statusMsg,
              {
                color:
                  statusMessage.type === 'success'
                    ? palette.nutrition
                    : palette.danger,
                textAlign: isRTL ? 'right' : 'left',
              },
            ]}
          >
            {statusMessage.text}
          </Text>
        )}
      </Card>

      {/* Pain / Injury Safety Banner */}
      {showPainBanner && (
        <View
          style={[
            styles.safetyBanner,
            {
              backgroundColor: palette.warningSoft,
              borderColor: palette.warning,
              flexDirection: isRTL ? 'row-reverse' : 'row',
            },
          ]}
        >
          <AlertTriangle size={18} color={palette.warning} />
          <View style={styles.safetyTextCol}>
            {Boolean(aiProgram?.safetyNote) && (
              <Text
                style={[
                  styles.safetyText,
                  {
                    color: palette.text,
                    textAlign: isRTL ? 'right' : 'left',
                    marginBottom: 4,
                  },
                ]}
              >
                {aiProgram?.safetyNote}
              </Text>
            )}
            <Text
              style={[
                styles.safetyText,
                { color: palette.text, textAlign: isRTL ? 'right' : 'left' },
              ]}
            >
              {t('painSafetyBanner')}
            </Text>
          </View>
        </View>
      )}

      {/* 7-Day Weekly List */}
      <View style={styles.listGap}>
        {activeSchedule.map((day) => {
          const isToday = day.dayIndex === todayIndex;
          const isCompletedToday = isToday && dailyLog.workoutCompleted;
          const dayTitle =
            settings.language === 'ar' ? day.titleAr : day.titleEn;

          const cardContent = (
            <Card
              style={[
                styles.dayRowCard,
                day.isRestDay && styles.restDayOpacity,
                isToday && {
                  borderColor: palette.workout,
                  borderWidth: 1.5,
                },
              ]}
            >
              <View
                style={[
                  styles.dayRowInner,
                  { flexDirection: isRTL ? 'row-reverse' : 'row' },
                ]}
              >
                <View
                  style={[
                    styles.dayBadge,
                    {
                      backgroundColor: isToday
                        ? palette.workoutSoft
                        : palette.cardElevated,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.dayBadgeText,
                      {
                        color: isToday ? palette.workout : palette.textMuted,
                      },
                    ]}
                  >
                    {daysShort[day.dayIndex]}
                  </Text>
                </View>

                <View style={styles.dayRowMiddle}>
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.dayRowTitle,
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
                  <Text
                    style={[
                      styles.dayRowMeta,
                      {
                        color: day.isRestDay
                          ? palette.textSubtle
                          : palette.textMuted,
                        textAlign: isRTL ? 'right' : 'left',
                      },
                    ]}
                  >
                    {day.isRestDay
                      ? t('restDayBadge')
                      : t('exercisesMinutesMeta', {
                          count: day.exercises.length,
                          minutes: day.estimatedMinutes,
                        })}
                  </Text>
                </View>

                {isCompletedToday && (
                  <CheckCircle2 size={20} color={palette.nutrition} />
                )}

                {!day.isRestDay && (
                  <ForwardIcon size={18} color={palette.textSubtle} />
                )}
              </View>
            </Card>
          );

          if (day.isRestDay) {
            return <View key={day.dayIndex}>{cardContent}</View>;
          }

          return (
            <Pressable
              key={day.dayIndex}
              onPress={() => {
                setSelectedDayIndex(day.dayIndex);
                setView('day');
              }}
              style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
              accessibilityRole="button"
            >
              {cardContent}
            </Pressable>
          );
        })}
      </View>

      {aiProgram && (
        <Text style={[styles.disclaimer, { color: palette.textSubtle }]}>
          {t('aiDisclaimer')}
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 18,
    gap: 14,
  },
  pageTitle: {
    fontFamily: FONTS.bold,
    fontSize: 24,
    lineHeight: 32,
  },
  headerCard: {
    gap: 12,
  },
  programHeaderTop: {
    alignItems: 'center',
    gap: 12,
  },
  programIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  programHeaderInfo: {
    flex: 1,
    gap: 2,
  },
  programTypeLabel: {
    fontFamily: FONTS.bold,
    fontSize: 15,
  },
  programMetaLine: {
    fontFamily: FONTS.regular,
    fontSize: 12.5,
  },
  aiHeaderActions: {
    gap: 10,
  },
  aiActionButtonsRow: {
    gap: 8,
  },
  compactActionBtn: {
    flex: 1,
    minHeight: 40,
    borderRadius: RADIUS.input,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 10,
  },
  compactActionText: {
    fontFamily: FONTS.bold,
    fontSize: 12.5,
  },
  confirmBox: {
    padding: 12,
    borderRadius: RADIUS.input,
    borderWidth: 1,
    gap: 8,
  },
  confirmTitle: {
    fontFamily: FONTS.bold,
    fontSize: 14,
  },
  confirmDesc: {
    fontFamily: FONTS.regular,
    fontSize: 12.5,
    lineHeight: 18,
  },
  confirmBtnRow: {
    gap: 8,
    marginTop: 2,
  },
  confirmActionBtn: {
    flex: 1,
    minHeight: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmActionTextLight: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: '#FFFFFF',
  },
  confirmActionTextDark: {
    fontFamily: FONTS.bold,
    fontSize: 13,
  },
  generatorCard: {
    gap: 12,
  },
  generatorHeader: {
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  generatorTitleRow: {
    alignItems: 'center',
    gap: 8,
  },
  cardHeading: {
    fontFamily: FONTS.bold,
    fontSize: 15.5,
  },
  generatorBody: {
    gap: 10,
  },
  notesLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: 13.5,
  },
  notesInput: {
    minHeight: 84,
    borderRadius: RADIUS.input,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: FONTS.regular,
    fontSize: 14,
    textAlignVertical: 'top',
  },
  privacyLine: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    lineHeight: 18,
  },
  statusMsg: {
    fontFamily: FONTS.semiBold,
    fontSize: 13,
    lineHeight: 19,
  },
  safetyBanner: {
    borderRadius: RADIUS.input,
    borderWidth: 1,
    padding: 12,
    alignItems: 'flex-start',
    gap: 10,
  },
  safetyTextCol: {
    flex: 1,
  },
  safetyText: {
    fontFamily: FONTS.semiBold,
    fontSize: 12.5,
    lineHeight: 19,
  },
  listGap: {
    gap: 10,
  },
  dayRowCard: {
    paddingVertical: 14,
  },
  restDayOpacity: {
    opacity: 0.72,
  },
  dayRowInner: {
    alignItems: 'center',
    gap: 12,
  },
  dayBadge: {
    minWidth: 52,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayBadgeText: {
    fontFamily: FONTS.bold,
    fontSize: 12.5,
  },
  dayRowMiddle: {
    flex: 1,
    gap: 2,
  },
  dayRowTitle: {
    fontFamily: FONTS.bold,
    fontSize: 15,
  },
  dayRowMeta: {
    fontFamily: FONTS.semiBold,
    fontSize: 12.5,
    fontVariant: ['tabular-nums'],
  },
  backRow: {
    alignItems: 'center',
    gap: 6,
    minHeight: 36,
    alignSelf: 'stretch',
  },
  backText: {
    fontFamily: FONTS.bold,
    fontSize: 15,
  },
  dayHeaderBlock: {
    gap: 4,
  },
  dayEyebrow: {
    fontFamily: FONTS.bold,
    fontSize: 13,
  },
  daySummaryMeta: {
    fontFamily: FONTS.semiBold,
    fontSize: 13.5,
    fontVariant: ['tabular-nums'],
  },
  finisherCard: {
    paddingVertical: 12,
  },
  finisherRow: {
    alignItems: 'center',
    gap: 10,
  },
  finisherText: {
    flex: 1,
    fontFamily: FONTS.semiBold,
    fontSize: 13.5,
    lineHeight: 20,
  },
  exerciseCard: {
    padding: 12,
  },
  exerciseCardRow: {
    alignItems: 'center',
    gap: 12,
  },
  exerciseInfoCol: {
    flex: 1,
    gap: 3,
  },
  exerciseCardTitle: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    lineHeight: 21,
  },
  exerciseMuscle: {
    fontFamily: FONTS.regular,
    fontSize: 12.5,
  },
  rxInlineRow: {
    alignItems: 'center',
    gap: 10,
    marginTop: 2,
  },
  rxProminent: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    fontVariant: ['tabular-nums'],
  },
  rxRestText: {
    fontFamily: FONTS.semiBold,
    fontSize: 12.5,
    fontVariant: ['tabular-nums'],
  },
  exerciseDetailTitle: {
    fontFamily: FONTS.bold,
    fontSize: 22,
    lineHeight: 30,
  },
  metaGrid: {
    gap: 8,
  },
  metaTile: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    gap: 4,
  },
  metaTileLabel: {
    fontFamily: FONTS.regular,
    fontSize: 11.5,
    textAlign: 'center',
  },
  metaTileValue: {
    fontFamily: FONTS.bold,
    fontSize: 13.5,
    textAlign: 'center',
  },
  metaTileSub: {
    fontFamily: FONTS.bold,
    fontSize: 13.5,
  },
  prescriptionCard: {
    gap: 14,
  },
  prescriptionRow: {
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  prescriptionBox: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  rxValue: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    fontVariant: ['tabular-nums'],
  },
  rxLabel: {
    fontFamily: FONTS.regular,
    fontSize: 12,
  },
  rxDivider: {
    width: 1,
    height: 36,
  },
  comingSoonNote: {
    fontFamily: FONTS.regular,
    fontSize: 13.5,
    lineHeight: 20,
  },
  disclaimer: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
});
