import { Language, WeightUnit } from '../types/coach';

const KG_TO_LB = 2.20462262;

export function kgToLb(kg: number): number {
  return Math.round(kg * KG_TO_LB * 10) / 10;
}

export function lbToKg(lb: number): number {
  return Math.round((lb / KG_TO_LB) * 10) / 10;
}

export function toDisplayWeight(kg: number, unit: WeightUnit): number {
  if (unit === 'lb') {
    return kgToLb(kg);
  }
  return Math.round(kg * 10) / 10;
}

export function fromDisplayWeight(value: number, unit: WeightUnit): number {
  if (unit === 'lb') {
    return lbToKg(value);
  }
  return value;
}

export function formatWeight(
  kg: number,
  unit: WeightUnit,
  language: Language
): string {
  const val = toDisplayWeight(kg, unit);
  const unitLabel =
    unit === 'kg'
      ? language === 'ar'
        ? 'كجم'
        : 'kg'
      : language === 'ar'
      ? 'رطل'
      : 'lb';
  return `${val} ${unitLabel}`;
}

export function getTodayDateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
