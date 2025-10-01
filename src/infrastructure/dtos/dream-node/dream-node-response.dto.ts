export interface DreamNodeResponseDto {
  id: string;
  title: string;
  description: string;
  interpretation: string;
  creationDate: Date;
  privacy: string;
  state: string;
  emotion: string;
}

export interface GetUserNodesResponseDto {
  success: boolean;
  data: DreamNodeResponseDto[];
  message?: string;
}