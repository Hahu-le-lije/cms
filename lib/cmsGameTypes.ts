export const CMS_GAME_TYPES = [
  { value: 'Fidel Tracing', label: 'Fidel Tracing' },
  { value: 'Fidel Match', label: 'Fidel Match' },
  { value: 'Pic-to-Word', label: 'Pic-to-Word' },
  { value: 'Word Builder', label: 'Word Builder' },
  { value: 'Listen & Fill', label: 'Listen & Fill' },
  { value: 'Speak Up', label: 'Speak Up' },
  { value: 'Story Quiz', label: 'Story Quiz' },
] as const;

export function getCmsGameTypeLabel(gameType?: string | null): string {
  if (!gameType) return 'Uncategorized';

  const match = CMS_GAME_TYPES.find((entry) => entry.value === gameType);
  return match?.label ?? gameType;
}
