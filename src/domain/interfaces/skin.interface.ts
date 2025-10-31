export interface Skin {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  previewLight?: string;
  previewDark?: string;
  supportsThemes: boolean;
  objectsLight?: string;
  objectsDark?: string;
  wallsLight?: string;
  wallsDark?: string;
  isDefault: boolean;
  isActive: boolean;
  price?: number;
  includedInPlan?: string;
  ownershipStatus: string;
  compatibleRooms?: string[];
  createdAt: string;
}