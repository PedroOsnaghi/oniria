import { IDreamNodeRepository } from "../../domain/repositories/dream-node.repository";
import { IDreamNode } from "../../domain/models/dream-node.model";
import { IPaginationOptions } from "../../domain/interfaces/pagination.interface";
import { IDreamContext } from "../../domain/interfaces/dream-context.interface";
import { DreamContextService } from "./dream-context.service";
import { IDreamNodeFilters } from "../../domain/interfaces/dream-node-filters.interface";

export interface TopItem {
  name: string;
  count: number;
}

export interface ContextStatistics {
  topPlaces: TopItem[];
  topEmotions: TopItem[];
  topPeople: TopItem[];
  topThemes: TopItem[];
}

export interface UserStatistics {
  totalInterpretations: number;
  weeklyInterpretations: number;
  sharedNodes: number;
  contextStats: ContextStatistics;
}

const ONE_WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000;
const LARGE_PAGE_SIZE = 1000;

export class StatisticsService {
  constructor(
    private dreamNodeRepository: IDreamNodeRepository,
    private dreamContextService: DreamContextService
  ) {}

  async getUserStatistics(userId: string): Promise<UserStatistics> {
    const [allNodes, dreamContext] = await Promise.all([
      this.getUserNodes(userId),
      this.getUserDreamContext(userId)
    ]);

    return {
      totalInterpretations: this.getTotalInterpretations(allNodes),
      weeklyInterpretations: this.getWeeklyInterpretations(allNodes),
      sharedNodes: this.getSharedNodesCount(allNodes),
      contextStats: this.getContextStatistics(dreamContext)
    };
  }

  private getTotalInterpretations(nodes: IDreamNode[]): number {
    return nodes.length;
  }

  private getWeeklyInterpretations(nodes: IDreamNode[]): number {
    const oneWeekAgo = new Date(Date.now() - ONE_WEEK_IN_MS);
    return nodes.filter(node => new Date(node.creationDate) >= oneWeekAgo).length;
  }

  private getSharedNodesCount(nodes: IDreamNode[]): number {
    return nodes.filter(node => node.privacy === 'Publico').length;
  }

  private getContextStatistics(context: IDreamContext): ContextStatistics {
    const emotions = (context as any).emotions || context.emotions_context || [];
    return {
      topPlaces: this.getTopItems(context.locations, 3),
      topEmotions: this.getTopItems(emotions, 3),
      topPeople: this.getTopItems(context.people, 3),
      topThemes: this.getTopItems(context.themes, 3)
    };
  }

  private getTopItems(items: Array<{ label: string; count: number }> = [], limit: number): TopItem[] {
    if (!items || !Array.isArray(items)) return [];
    return [...items]
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
      .map(item => ({
        name: item.label,
        count: item.count
      }));
  }

  private async getUserDreamContext(userId: string): Promise<IDreamContext> {
    try {
      const context = await this.dreamContextService.getUserDreamContext(userId);
      return context;
    } catch (error) {
      console.error('Error getting user dream context:', error);
      return {
        themes: [],
        people: [],
        locations: [],
        emotions_context: []
      };
    }
  }

  private async getUserNodes(userId: string): Promise<IDreamNode[]> {
    try {

      const pagination: IPaginationOptions = {
        page: 1,
        limit: LARGE_PAGE_SIZE
      };
      const filters: IDreamNodeFilters = {state: 'Activo'};
      const userNodes = await this.dreamNodeRepository.getUserNodes(userId, filters, pagination);
      return userNodes || [];
    } catch (error) {
      console.error('Error getting user nodes:', error);
      return [];
    }
  }
}
