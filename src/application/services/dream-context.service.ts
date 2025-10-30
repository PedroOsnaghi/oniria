import { IDreamContext } from "../../domain/interfaces/dream-context.interface";
import { IDreamNodeRepository } from "../../domain/repositories/dream-node.repository";

export class DreamContextService {
  constructor(private dreamNodeRepository: IDreamNodeRepository) {}

  async getUserDreamContext(userId: string): Promise<IDreamContext> {
    return this.dreamNodeRepository.getUserDreamContext(userId);
  }

}