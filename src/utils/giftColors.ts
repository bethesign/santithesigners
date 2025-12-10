// Color palette from Figma design
const GIFT_COLORS = [
  'bg-red-600',
  'bg-emerald-600',
  'bg-blue-600',
  'bg-amber-500',
  'bg-purple-600',
  'bg-red-700',
  'bg-teal-600',
  'bg-indigo-600',
  'bg-rose-500',
  'bg-yellow-500',
  'bg-green-700',
  'bg-red-500',
  'bg-sky-500',
  'bg-orange-500',
  'bg-amber-600',
  'bg-pink-600',
  'bg-lime-600',
  'bg-cyan-600',
  'bg-emerald-700',
  'bg-violet-600',
];

export function getGiftColor(index: number): string {
  return GIFT_COLORS[index % GIFT_COLORS.length];
}

export function assignColorsToGifts<T extends { id: string }>(gifts: T[]): (T & { color: string })[] {
  return gifts.map((gift, index) => ({
    ...gift,
    color: getGiftColor(index)
  }));
}
