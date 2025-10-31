export interface SkinResponseDto {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  creationDate: string;
  userId: string;
  isActive: boolean;
  isDefault: boolean;
  ownershipStatus: string;
  compatibleRooms?: string[];
  previewLight?: string;
  previewDark?: string;
  price?: number;
  includedInPlan?: string;
}

export interface GetUserSkinsResponseDto {
  success: boolean;
  data: SkinResponseDto[];
  message?: string;
}