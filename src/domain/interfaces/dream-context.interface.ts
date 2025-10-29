import { ContextItem } from './dream-context-item.interface';

export interface IDreamContext {
  themes: ContextItem[];
  people: ContextItem[];
  locations: ContextItem[];
  emotions_context: ContextItem[];
}