
export interface TopItemDto {
  name: string;
  count: number;
}

export interface ContextStatisticsDto {
  topPlaces: TopItemDto[];
  topEmotions: TopItemDto[];
  topPeople: TopItemDto[];
  topThemes: TopItemDto[];
}

export interface StatisticsResponseDto {
  success: boolean;
  data: {
    totalInterpretations: number;
    weeklyInterpretations: number;
    sharedNodes: number;
    contextStats: ContextStatisticsDto;
  };
}
