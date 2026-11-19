import { Allergy, DietPreference, MacroTargets, MealSlot, MealTemplate, PlannedMeal } from '../types/coach';

/**
 * Curated deterministic meal pool supporting Regular, Vegetarian, Keto, and Lactose-Free diets
 * with explicit allergen tags for safe filtering.
 */
export const MEAL_TEMPLATES: MealTemplate[] = [
  // ==================== BREAKFAST ====================
  {
    id: 'bf_oats_eggs',
    slot: 'breakfast',
    nameAr: 'بيض مسلوق مع شوفان وفواكه',
    nameEn: 'Boiled Eggs & Oat Bowl',
    descriptionAr: '٣ بيضات مع شوفان مطبوخ وتوت طازج',
    descriptionEn: '3 boiled eggs with rolled oats and berries',
    diets: ['regular', 'lactose_free'],
    allergens: ['eggs', 'gluten'],
    calorieRatio: 0.25,
  },
  {
    id: 'bf_greek_yogurt_chia',
    slot: 'breakfast',
    nameAr: 'زبادي يوناني مع بذور الشيا والعسل',
    nameEn: 'Greek Yogurt & Chia Parfait',
    descriptionAr: 'زبادي عالي البروتين مع شيا وقطع فراولة',
    descriptionEn: 'High-protein yogurt with chia seeds and strawberries',
    diets: ['regular', 'vegetarian'],
    allergens: ['dairy'],
    calorieRatio: 0.25,
  },
  {
    id: 'bf_keto_avocado_eggs',
    slot: 'breakfast',
    nameAr: 'أومليت بالأفوكادو والسبانخ',
    nameEn: 'Avocado & Spinach Omelette',
    descriptionAr: '٣ بيضات مخفوقة مع سبانخ ونصف حبة أفوكادو',
    descriptionEn: '3-egg omelette sautéed with spinach and avocado',
    diets: ['regular', 'keto', 'lactose_free', 'vegetarian'],
    allergens: ['eggs'],
    calorieRatio: 0.25,
  },
  {
    id: 'bf_tofu_scramble',
    slot: 'breakfast',
    nameAr: 'توفو مشوح بالخضار وزيت الزيتون',
    nameEn: 'Veggie Tofu Scramble',
    descriptionAr: 'توفو متبل مع فلفل ألوان وسبانخ وزيت زيتون',
    descriptionEn: 'Seasoned tofu scramble with bell peppers and spinach',
    diets: ['vegetarian', 'keto', 'lactose_free'],
    allergens: ['soy'],
    calorieRatio: 0.25,
  },
  {
    id: 'bf_quinoa_berries',
    slot: 'breakfast',
    nameAr: 'كينوا دافئة بالحليب النباتي والقرفة',
    nameEn: 'Warm Quinoa Berry Bowl',
    descriptionAr: 'كينوا مطهوة مع توت وبذور اليقطين',
    descriptionEn: 'Cooked quinoa with berries and pumpkin seeds',
    diets: ['regular', 'vegetarian', 'lactose_free'],
    allergens: [],
    calorieRatio: 0.25,
  },

  // ==================== LUNCH ====================
  {
    id: 'ln_chicken_rice',
    slot: 'lunch',
    nameAr: 'صدر دجاج مشوي مع أرز بسمتي وسلطة',
    nameEn: 'Grilled Chicken, Basmati Rice & Greens',
    descriptionAr: 'دجاج متبل بالأعشاب مع أرز بسمتي وخضار مشوية',
    descriptionEn: 'Herb-grilled chicken breast with basmati rice and roasted veggies',
    diets: ['regular', 'lactose_free'],
    allergens: [],
    calorieRatio: 0.35,
  },
  {
    id: 'ln_salmon_quinoa',
    slot: 'lunch',
    nameAr: 'فيليه سلمون مع كينوا وبروكلي',
    nameEn: 'Baked Salmon, Quinoa & Broccoli',
    descriptionAr: 'سلمون مشوي بالليمون مع كينوا وبروكلي مطهو بالبخار',
    descriptionEn: 'Lemon-baked salmon with quinoa and steamed broccoli',
    diets: ['regular', 'lactose_free'],
    allergens: ['seafood'],
    calorieRatio: 0.35,
  },
  {
    id: 'ln_keto_beef_cauliflower',
    slot: 'lunch',
    nameAr: 'شرائح لحم مشوية مع أرز القرنبيط',
    nameEn: 'Grilled Steak & Cauliflower Mash',
    descriptionAr: 'لحم بقري قليل الدهن مع قرنبيط مهروس بزيت الزيتون',
    descriptionEn: 'Lean grilled beef steak with olive-oil cauliflower mash',
    diets: ['regular', 'keto', 'lactose_free'],
    allergens: [],
    calorieRatio: 0.35,
  },
  {
    id: 'ln_lentil_quinoa_bowl',
    slot: 'lunch',
    nameAr: 'وعاء العدس والكينوا بالخضار المشوية',
    nameEn: 'Lentil & Quinoa Power Bowl',
    descriptionAr: 'عدس غني بالبروتين مع كينوا وخضار موسمية',
    descriptionEn: 'Protein-rich brown lentils with quinoa and roasted vegetables',
    diets: ['regular', 'vegetarian', 'lactose_free'],
    allergens: [],
    calorieRatio: 0.35,
  },

  // ==================== SNACK ====================
  {
    id: 'sn_almonds_apple',
    slot: 'snack',
    nameAr: 'تفاحة خضراء مع حفنة لوز نيء',
    nameEn: 'Green Apple & Raw Almonds',
    descriptionAr: 'تفاحة طازجة مع ٢٠ غرام لوز غير مملح',
    descriptionEn: 'Crisp apple slices with 20g raw unsalted almonds',
    diets: ['regular', 'vegetarian', 'lactose_free'],
    allergens: ['nuts'],
    calorieRatio: 0.15,
  },
  {
    id: 'sn_keto_olives_cucumber',
    slot: 'snack',
    nameAr: 'شرائح خيار مع زيتون وجوز',
    nameEn: 'Cucumber, Olives & Pumpkin Seeds',
    descriptionAr: 'خيار مقرمش مع زيتون وبذور اليقطين المحمصة',
    descriptionEn: 'Crisp cucumber with olives and roasted pumpkin seeds',
    diets: ['regular', 'vegetarian', 'keto', 'lactose_free'],
    allergens: [],
    calorieRatio: 0.15,
  },
  {
    id: 'sn_roasted_chickpeas',
    slot: 'snack',
    nameAr: 'حمص محمص بالتوابل',
    nameEn: 'Spiced Roasted Chickpeas',
    descriptionAr: 'حمص مقرمش مشوي بالكمون والبابريكا',
    descriptionEn: 'Crunchy oven-roasted chickpeas with cumin and paprika',
    diets: ['regular', 'vegetarian', 'lactose_free'],
    allergens: [],
    calorieRatio: 0.15,
  },

  // ==================== DINNER ====================
  {
    id: 'dn_turkey_sweet_potato',
    slot: 'dinner',
    nameAr: 'صدر ديك رومي مع بطاطا حلوة',
    nameEn: 'Herb Turkey & Sweet Potato',
    descriptionAr: 'شرائح ديك رومي مشوية مع بطاطا حلوة وسلطة خضراء',
    descriptionEn: 'Grilled turkey breast with baked sweet potato and salad',
    diets: ['regular', 'lactose_free'],
    allergens: [],
    calorieRatio: 0.25,
  },
  {
    id: 'dn_keto_chicken_salad',
    slot: 'dinner',
    nameAr: 'سلطة دجاج مشوي بالأفوكادو وزيت الزيتون',
    nameEn: 'Keto Avocado Chicken Salad',
    descriptionAr: 'دجاج مشوي على أوراق جرجير وخس مع أفوكادو',
    descriptionEn: 'Grilled chicken over arugula and lettuce with avocado',
    diets: ['regular', 'keto', 'lactose_free'],
    allergens: [],
    calorieRatio: 0.25,
  },
  {
    id: 'dn_veggie_chickpea_curry',
    slot: 'dinner',
    nameAr: 'يخنة الحمص والخضار بزيت جوز الهند',
    nameEn: 'Chickpea & Spinach Coconut Stew',
    descriptionAr: 'حمص مطهو مع السبانخ والطماطم والتوابل الخفيفة',
    descriptionEn: 'Simmered chickpeas with spinach, tomatoes, and light spices',
    diets: ['regular', 'vegetarian', 'lactose_free'],
    allergens: [],
    calorieRatio: 0.25,
  },
  {
    id: 'dn_keto_mushroom_zucchini',
    slot: 'dinner',
    nameAr: 'نودلز الكوسة بالفطر وزيت الزيتون',
    nameEn: 'Garlic Mushroom Zucchini Noodles',
    descriptionAr: 'كوسة مقطعة مع فطر طازج وبذور السمسم',
    descriptionEn: 'Sautéed zucchini noodles with mushrooms and sesame seeds',
    diets: ['vegetarian', 'keto', 'lactose_free'],
    allergens: [],
    calorieRatio: 0.25,
  },
];

const SLOTS: MealSlot[] = ['breakfast', 'lunch', 'snack', 'dinner'];

export function buildDailyMeals(
  diet: DietPreference,
  allergies: Allergy[],
  targetCalories: number,
  macros: MacroTargets
): PlannedMeal[] {
  return SLOTS.map((slot) => {
    const safeForSlot = MEAL_TEMPLATES.filter(
      (tpl) =>
        tpl.slot === slot &&
        tpl.diets.includes(diet) &&
        !tpl.allergens.some((a) => allergies.includes(a))
    );

    const fallback =
      MEAL_TEMPLATES.find(
        (tpl) =>
          tpl.slot === slot &&
          !tpl.allergens.some((a) => allergies.includes(a))
      ) ?? MEAL_TEMPLATES.find((tpl) => tpl.slot === slot)!;

    const chosen = safeForSlot[0] ?? fallback;

    return {
      id: `${chosen.id}_${slot}`,
      slot,
      nameAr: chosen.nameAr,
      nameEn: chosen.nameEn,
      descriptionAr: chosen.descriptionAr,
      descriptionEn: chosen.descriptionEn,
      calories: Math.round(targetCalories * chosen.calorieRatio),
      proteinG: Math.round(macros.proteinG * chosen.calorieRatio),
      carbsG: Math.round(macros.carbsG * chosen.calorieRatio),
      fatG: Math.round(macros.fatG * chosen.calorieRatio),
    };
  });
}
