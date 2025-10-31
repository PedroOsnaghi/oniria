export interface Room {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  previewLight?: string;
  previewDark?: string;
  modelUrl?: string;
  isDefault: boolean;
  price?: number;
  includedInPlan?: string;
  ownershipStatus: string;
  compatibleSkins?: string[];
  createdAt: Date;
}