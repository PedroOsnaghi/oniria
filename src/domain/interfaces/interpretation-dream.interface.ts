import { DreamTypeName } from '../models/dream_type.model';
import { ContextItem } from './dream-context-item.interface';

export interface DreamContext {
  themes: ContextItem[];
  people: ContextItem[];
  locations: ContextItem[];
  emotions_context: ContextItem[];
}

export interface Interpretation {
  title: string;
  interpretation: string;
  emotion: string;
  context: DreamContext;
  dreamType: DreamTypeName;
  dreamTypeReason: string;
}
