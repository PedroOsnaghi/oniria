import { IDreamContext } from '../interfaces/dream-context.interface';

export interface DreamAnalysis {
  themes: string[];
  people: string[];
  locations: string[];
  emotions: string[];
}

export function isRecurringDream(
  currentDream: DreamAnalysis,
  userContext: IDreamContext,
  minCategoryMatches: number = 2
): { isRecurring: boolean } {
  if (!userContext) {
    return { isRecurring: false };
  }

  const contextThemes = userContext.themes?.map(t => t.label.toLowerCase()) || [];
  const contextPeople = userContext.people?.map(p => p.label.toLowerCase()) || [];
  const contextLocations = userContext.locations?.map(l => l.label.toLowerCase()) || [];
  const contextEmotions = userContext.emotions_context?.map(e => e.label.toLowerCase()) || [];

  const hasThemeMatch = currentDream.themes.some(theme =>
    contextThemes.includes(theme.toLowerCase())
  );

  const hasPersonMatch = currentDream.people.some(person =>
    contextPeople.includes(person.toLowerCase())
  );

  const hasLocationMatch = currentDream.locations.some(location =>
    contextLocations.includes(location.toLowerCase())
  );

  const hasEmotionMatch = currentDream.emotions.some(emotion =>
    contextEmotions.includes(emotion.toLowerCase())
  );

  const matchingCategories = [
    hasThemeMatch,
    hasPersonMatch,
    hasLocationMatch,
    hasEmotionMatch
  ].filter(Boolean).length;

  const hasNonEmotionMatch = hasThemeMatch || hasPersonMatch || hasLocationMatch;

  return {
    isRecurring: matchingCategories >= minCategoryMatches && hasNonEmotionMatch
  };

}
