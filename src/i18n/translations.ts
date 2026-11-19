import { Language } from '../types/coach';

export const TRANSLATIONS = {
  ar: {
    appName: 'مدربي الشخصي',
    continueBtn: 'التالي',
    backBtn: 'رجوع',
    stepOf: 'الخطوة {current} من {total}',
    kcal: 'سعرة',
    gram: 'جم',
    ml: 'مل',
    min: 'دقيقة',
    sets: 'مجموعات',
    reps: 'تكرار',
    rest: 'راحة',
    sec: 'ث',

    // Onboarding Steps
    step1Title: 'بياناتك الأساسية',
    step1Subtitle: 'نستخدم هذه البيانات لحساب احتياجك اليومي بدقة وأمان.',
    nameLabel: 'الاسم الأول (اختياري)',
    namePlaceholder: 'مثال: أحمد',
    ageLabel: 'العمر (١٤ - ٨٠)',
    genderLabel: 'الجنس',
    male: 'ذكر',
    female: 'أنثى',
    heightLabel: 'الطول (سم)',
    currentWeightLabel: 'الوزن الحالي',
    targetWeightLabel: 'الوزن المستهدف',
    errInvalidAge: 'يرجى إدخال عمر واقعي بين ١٤ و ٨٠ سنة.',
    errInvalidHeight: 'يرجى إدخال طول واقعي بين ١٢٠ و ٢٣٠ سم.',
    errInvalidWeight: 'يرجى إدخال وزن واقعي بين ٣٥ و ٢٥٠ كجم.',
    errInvalidTargetWeight: 'يرجى إدخال وزن مستهدف واقعي بين ٣٥ و ٢٥٠ كجم.',

    step2Title: 'ما هو هدفك الأساسي؟',
    step2Subtitle: 'سيتم ضبط السعرات ونظام التمرين بناءً على هدفك.',
    goalFatLoss: 'خسارة الدهون',
    goalFatLossDesc: 'عجز سعرات آمن للحفاظ على الكتلة العضلية',
    goalMuscleGain: 'بناء العضلات',
    goalMuscleGainDesc: 'فائض سعرات معتدل مع تمارين مقاومة منظمة',
    goalImproveFitness: 'تحسين اللياقة البدنية',
    goalImproveFitnessDesc: 'توازن بين القوة البدنية والتحمل القلبي',
    goalMaintain: 'الحفاظ على الوزن',
    goalMaintainDesc: 'ثبات الوزن مع تعزيز النشاط والصحة العامة',

    step3Title: 'إعداد التمرين',
    step3Subtitle: 'اختر مستواك وعدد أيام التمرين ومكان التدريب.',
    levelLabel: 'مستوى الخبرة',
    beginner: 'مبتدئ',
    intermediate: 'متوسط',
    advanced: 'متقدم',
    daysLabel: 'أيام التمرين أسبوعياً',
    daysUnit: 'أيام',
    dayUnit: 'يوم',
    placeLabel: 'مكان التمرين',
    gym: 'النادي الرياضي (الجيم)',
    home: 'المنزل (وزن الجسم / دمبل)',

    step4Title: 'التفضيل الغذائي والحساسية',
    step4Subtitle: 'نستبعد أي مكونات لا تناسب نظامك الغذائي.',
    dietLabel: 'النظام الغذائي',
    dietRegular: 'عادي ومتوازن',
    dietVegetarian: 'نباتي',
    dietKeto: 'كيتو (قليل الكربوهيدرات)',
    dietLactoseFree: 'خالي من اللاكتوز',
    allergiesLabel: 'الحساسية الغذائية (اختياري)',
    allergyDairy: 'الألبان',
    allergyNuts: 'المكسرات',
    allergyGluten: 'الجلوتين',
    allergyEggs: 'البيض',
    allergySeafood: 'المأكولات البحرية',
    allergySoy: 'الصويا',

    step5Title: 'جاري تجهيز خطتك الشخصية...',
    step5Stage1: 'حساب معدل الأيض الأساسي (Mifflin-St Jeor)',
    step5Stage2: 'تطبيق قواعد الأمان والحد الأدنى للسعرات',
    step5Stage3: 'توزيع أيام التمرين والراحة بالتساوي',
    step5Stage4: 'موازنة الوجبات حسب التفضيل والحساسية',

    step6Title: 'ملخص خطتك الشخصية',
    step6Subtitle: 'خطتك جاهزة! إليك أهدافك اليومية وجدولك الأسبوعي.',
    dailyCaloriesLabel: 'السعرات اليومية',
    protein: 'بروتين',
    carbs: 'كربوهيدرات',
    fat: 'دهون',
    waterGoalLabel: 'هدف الماء اليومي',
    weeklySplitLabel: 'الجدول الأسبوعي للتمرين',
    startJourneyBtn: 'ابدأ رحلتك الآن',
    under18Note:
      'ملاحظة أمان: لأن عمرك أقل من ١٨ عاماً، هذه الخطة إرشادية عامة ويُنصح باستشارة أحد الوالدين أو الطبيب قبل البدء.',
    targetAdjustedNote:
      'تم تعديل الوزن المستهدف برفق إلى {weight} ليكون ضمن النطاق الصحي والواقعي لهدفك.',
    calorieFloorNote:
      'تم تثبيت السعرات عند الحد الأدنى الآمن ({calories} سعرة) لحماية صحتك ومعدل الأيض.',
    deficitCappedNote:
      'تم تحديد العجز اليومي بحيث لا تتجاوز خسارة الوزن الأسبوعية ~١٪ من وزن جسمك.',
    medicalDisclaimer: 'هذه الخطة إرشادية عامة وليست نصيحة طبية.',

    // Tabs
    tabHome: 'الرئيسية',
    tabWorkouts: 'التمارين',
    tabNutrition: 'التغذية',
    tabProgress: 'التقدم',
    tabProfile: 'حسابي',

    // Home Dashboard
    greetingMorning: 'صباح النشاط',
    greetingAfternoon: 'يوم موفق',
    greetingEvening: 'مساء العافية',
    coachSubtitle: 'ملخص يومك التدريبي والغذائي',
    caloriesLeftLabel: 'السعرات المتبقية',
    caloriesConsumedOf: 'تم إكمال {consumed} من {total}',
    macrosLeftTitle: 'الماكروز المتبقية اليوم',
    waterTrackerTitle: 'متابع شرب الماء',
    waterAdd250: '+ ٢٥٠ مل',
    waterGoalReached: 'أحسنت! حققت هدف الماء اليوم',
    todaysWorkoutTitle: 'تمرين اليوم',
    restDayBadge: 'يوم راحة',
    restDayDesc: 'ركز اليوم على المشي الخفيف والنوم الجيد للاستشفاء.',
    markWorkoutDone: 'تحديد كمكتمل',
    workoutCompleted: 'تم إكمال التمرين',
    exercisesCount: '{count} تمارين',
    nextMealTitle: 'الوجبة القادمة',
    allMealsDoneTitle: 'أكملت جميع وجبات اليوم!',
    allMealsDoneDesc: 'عمل رائع! التزمت بكامل خطتك الغذائية لليوم.',
    quickCompleteMeal: 'إكمال الوجبة',
    undoLastMeal: 'تراجع',

    // Meal slots
    slotBreakfast: 'الفطور',
    slotLunch: 'الغداء',
    slotSnack: 'سناك',
    slotDinner: 'العشاء',

    // Days of week (0 = Sun .. 6 = Sat)
    daysShort: ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'],

    // Profile & Settings
    profileTitle: 'الملف الشخصي والإعدادات',
    planSnapshotTitle: 'ملخص خطتك الحالية',
    currentWeightShort: 'الوزن الحالي',
    targetWeightShort: 'الهدف',
    dailyTargetShort: 'الهدف اليومي',
    recalculatePlanBtn: 'إعادة حساب الخطة (تعديل البيانات)',
    preferencesTitle: 'تفضيلات التطبيق',
    languageLabel: 'اللغة',
    arabicLabel: 'العربية (RTL)',
    englishLabel: 'English (LTR)',
    themeLabel: 'المظهر',
    darkLabel: 'داكن',
    lightLabel: 'فاتح',
    unitsLabel: 'وحدة الوزن',
    kgLabel: 'كجم (kg)',
    lbLabel: 'رطل (lb)',
    aiSettingsTeaserTitle: 'إعدادات الذكاء الاصطناعي (قريباً)',
    aiSettingsTeaserDesc:
      'في المراحل القادمة يمكنك إضافة مفتاح Gemini الخاص بك اختيارياً. التطبيق يعمل بالكامل بدونه.',

    // Coming Soon
    comingSoonBadge: 'قريباً في المرحلة القادمة',
    comingSoonWorkoutsTitle: 'مكتبة التمارين والتتبع المباشر',
    comingSoonWorkoutsDesc:
      'تتبع الجولات والأوزان ومؤقت الراحة وشرح التمارين بالفيديو سيصل في المرحلة الثانية.',
    comingSoonNutritionTitle: 'سجل التغذية وتبديل الوجبات',
    comingSoonNutritionDesc:
      'تبديل الوجبات المرن والبحث الغذائي وإضافة الوجبات اليومية قيد التطوير للمرحلة القادمة.',
    comingSoonProgressTitle: 'الرسوم البيانية وتطور الأداء',
    comingSoonProgressDesc:
      'متابعة تغير الوزن والقياسات وسجل الالتزام الأسبوعي ستتوفر في المرحلة القادمة.',
  },
  en: {
    appName: 'My Personal Coach',
    continueBtn: 'Continue',
    backBtn: 'Back',
    stepOf: 'Step {current} of {total}',
    kcal: 'kcal',
    gram: 'g',
    ml: 'ml',
    min: 'min',
    sets: 'sets',
    reps: 'reps',
    rest: 'rest',
    sec: 's',

    // Onboarding Steps
    step1Title: 'Your Basic Details',
    step1Subtitle: 'Used locally to calculate your daily energy and safety targets.',
    nameLabel: 'First Name (optional)',
    namePlaceholder: 'e.g. Alex',
    ageLabel: 'Age (14 - 80)',
    genderLabel: 'Gender',
    male: 'Male',
    female: 'Female',
    heightLabel: 'Height (cm)',
    currentWeightLabel: 'Current Weight',
    targetWeightLabel: 'Target Weight',
    errInvalidAge: 'Please enter a valid age between 14 and 80.',
    errInvalidHeight: 'Please enter a realistic height between 120 and 230 cm.',
    errInvalidWeight: 'Please enter a realistic weight between 35 and 250 kg.',
    errInvalidTargetWeight: 'Please enter a realistic target weight between 35 and 250 kg.',

    step2Title: 'What is your main goal?',
    step2Subtitle: 'Calories, macros, and workout structure adapt to your goal.',
    goalFatLoss: 'Fat Loss',
    goalFatLossDesc: 'Safe calorie deficit designed to preserve lean muscle',
    goalMuscleGain: 'Muscle Gain',
    goalMuscleGainDesc: 'Moderate surplus paired with progressive resistance splits',
    goalImproveFitness: 'Improve Fitness',
    goalImproveFitnessDesc: 'Balanced strength work and cardiovascular conditioning',
    goalMaintain: 'Maintain Weight',
    goalMaintainDesc: 'Steady energy intake for consistency and overall health',

    step3Title: 'Training Setup',
    step3Subtitle: 'Choose your experience level, weekly frequency, and location.',
    levelLabel: 'Experience Level',
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
    daysLabel: 'Training Days / Week',
    daysUnit: 'days',
    dayUnit: 'day',
    placeLabel: 'Training Place',
    gym: 'Gym (Full Equipment)',
    home: 'Home (Bodyweight / Dumbbells)',

    step4Title: 'Diet & Allergies',
    step4Subtitle: 'We filter your meal suggestions around your dietary rules.',
    dietLabel: 'Diet Preference',
    dietRegular: 'Regular & Balanced',
    dietVegetarian: 'Vegetarian',
    dietKeto: 'Keto (Low Carb)',
    dietLactoseFree: 'Lactose-Free',
    allergiesLabel: 'Food Allergies (optional)',
    allergyDairy: 'Dairy',
    allergyNuts: 'Nuts',
    allergyGluten: 'Gluten',
    allergyEggs: 'Eggs',
    allergySeafood: 'Seafood',
    allergySoy: 'Soy',

    step5Title: 'Building your personal plan...',
    step5Stage1: 'Calculating BMR & TDEE (Mifflin-St Jeor)',
    step5Stage2: 'Applying calorie floors & safe weekly rate limits',
    step5Stage3: 'Distributing workouts & rest days evenly',
    step5Stage4: 'Matching meals to your diet and allergies',

    step6Title: 'Your Plan Summary',
    step6Subtitle: 'Everything is ready. Review your daily targets and weekly split.',
    dailyCaloriesLabel: 'Daily Calories',
    protein: 'Protein',
    carbs: 'Carbs',
    fat: 'Fat',
    waterGoalLabel: 'Daily Water Goal',
    weeklySplitLabel: 'Weekly Workout Schedule',
    startJourneyBtn: 'Start your journey',
    under18Note:
      'Safety note: Since you are under 18, this plan is general guidance—please consult a parent or doctor before starting.',
    targetAdjustedNote:
      'Your target weight was gently adjusted to {weight} so your plan stays safe and realistic.',
    calorieFloorNote:
      'Daily calories were protected at the minimum safe floor ({calories} kcal).',
    deficitCappedNote:
      'Your daily deficit was capped so weekly weight loss stays within ~1% of your body weight.',
    medicalDisclaimer: 'This plan is general guidance, not medical advice.',

    // Tabs
    tabHome: 'Home',
    tabWorkouts: 'Workouts',
    tabNutrition: 'Nutrition',
    tabProgress: 'Progress',
    tabProfile: 'Profile',

    // Home Dashboard
    greetingMorning: 'Good morning',
    greetingAfternoon: 'Good afternoon',
    greetingEvening: 'Good evening',
    coachSubtitle: "Today's training and nutrition overview",
    caloriesLeftLabel: 'Calories Left',
    caloriesConsumedOf: '{consumed} of {total} kcal completed',
    macrosLeftTitle: 'Macros Left Today',
    waterTrackerTitle: 'Water Tracker',
    waterAdd250: '+250 ml',
    waterGoalReached: 'Great job! Daily water goal reached',
    todaysWorkoutTitle: "Today's Workout",
    restDayBadge: 'Rest Day',
    restDayDesc: 'Focus on light walking, hydration, and quality sleep today.',
    markWorkoutDone: 'Mark Done',
    workoutCompleted: 'Workout Done',
    exercisesCount: '{count} exercises',
    nextMealTitle: 'Next Meal',
    allMealsDoneTitle: 'All daily meals completed!',
    allMealsDoneDesc: 'Great consistency—you checked off every meal for today.',
    quickCompleteMeal: 'Mark Eaten',
    undoLastMeal: 'Undo',

    // Meal slots
    slotBreakfast: 'Breakfast',
    slotLunch: 'Lunch',
    slotSnack: 'Snack',
    slotDinner: 'Dinner',

    // Days of week (0 = Sun .. 6 = Sat)
    daysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],

    // Profile & Settings
    profileTitle: 'Profile & Settings',
    planSnapshotTitle: 'Current Plan Summary',
    currentWeightShort: 'Current',
    targetWeightShort: 'Target',
    dailyTargetShort: 'Daily Target',
    recalculatePlanBtn: 'Recalculate Plan (Edit Details)',
    preferencesTitle: 'App Preferences',
    languageLabel: 'Language',
    arabicLabel: 'العربية (RTL)',
    englishLabel: 'English (LTR)',
    themeLabel: 'Appearance',
    darkLabel: 'Dark',
    lightLabel: 'Light',
    unitsLabel: 'Weight Units',
    kgLabel: 'kg',
    lbLabel: 'lb',
    aiSettingsTeaserTitle: 'AI Coach Settings (Coming Soon)',
    aiSettingsTeaserDesc:
      'Later phases will let you optionally add your own Gemini API key via SecureStore. The app works fully without one.',

    // Coming Soon
    comingSoonBadge: 'Coming Soon',
    comingSoonWorkoutsTitle: 'Interactive Workouts & Form Guides',
    comingSoonWorkoutsDesc:
      'Set-by-set logging, rest timers, and exercise video guides are scheduled for Phase 2.',
    comingSoonNutritionTitle: 'Full Meal Logging & Swaps',
    comingSoonNutritionDesc:
      'Flexible meal swaps, custom food logging, and barcode tools are scheduled for Phase 2.',
    comingSoonProgressTitle: 'Progress Charts & Body Trends',
    comingSoonProgressDesc:
      'Weight trend graphs, adherence streaks, and personal records are scheduled for Phase 2.',
  },
} as const;

export type TranslationKey = keyof typeof TRANSLATIONS.en;

export function translate(
  language: Language,
  key: TranslationKey,
  params?: Record<string, string | number>
): string {
  const dict = TRANSLATIONS[language];
  const raw = dict[key];
  if (typeof raw !== 'string') {
    return String(key);
  }
  if (!params) return raw;
  return Object.entries(params).reduce<string>(
    (acc, [paramKey, val]) => acc.replace(`{${paramKey}}`, String(val)),
    raw
  );
}
