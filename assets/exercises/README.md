# Exercise Images (`assets/exercises/`)

Drop exercise image files directly into this folder using the exact `id` from `src/data/exercises.ts`.

## Rules & Recommendations
- **File naming**: `<exercise_id>.jpg` (supports `.jpg`, `.jpeg`, `.png`, `.webp`).
  - Example: `gym_chest_db_bench.jpg`
- **Recommended dimensions & size**: ~800px wide, under 150 KB per image.

## Workflow
1. Add or replace image files in `assets/exercises/`.
2. Regenerate the static React Native asset registry:
   ```bash
   npm run gen:images
   ```
3. Clear Metro cache and start Expo:
   ```bash
   npx expo start -c
   ```

## Adding a New Exercise
1. Add the exercise object to `EXERCISES` in `src/data/exercises.ts` with a unique `id`.
2. Add `<id>.jpg` (or `.png` / `.webp`) to `assets/exercises/`.
3. Run `npm run gen:images`.
