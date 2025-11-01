import { MissionService } from '../../../../src/application/services/mission.service';
import { Badge } from '../../../../src/domain/models/badge.model';

describe('MissionService - Badges', () => {
  let missionService: MissionService;
  let dreamNodeRepository: any;
  let missionRepository: any;
  let badgeRepository: any;

  beforeEach(() => {
    dreamNodeRepository = {
      countUserNodes: jest.fn(),
      getUserNodes: jest.fn()
    };
    missionRepository = {
      getAllMissions: jest.fn(),
      getUserMission: jest.fn(),
      upsertUserMission: jest.fn()
    };
    badgeRepository = {
      awardBadge: jest.fn(),
      getBadgeById: jest.fn()
    };
    missionService = new MissionService(dreamNodeRepository, missionRepository, badgeRepository);
  });

  it('should unlock badge for counter mission via onDreamSaved', async () => {
    missionRepository.getAllMissions.mockResolvedValue([
      { code: 'first_dream', target: 1, badgeId: 'b1' }
    ]);
    missionRepository.getUserMission.mockResolvedValue({ progress: 0, completedAt: null });
    badgeRepository.getBadgeById.mockResolvedValue({ id: 'b1' });
    dreamNodeRepository.countUserNodes.mockResolvedValue(1);
    dreamNodeRepository.getUserNodes.mockResolvedValue([]);

    const badges = await missionService.onDreamSaved('user');
    expect(badges).toEqual([{ id: 'b1' }]);
    expect(badgeRepository.awardBadge).toHaveBeenCalledWith('user', 'b1');
  });

  it('should not unlock badge for counter mission if already completed via onDreamSaved', async () => {
    missionRepository.getAllMissions.mockResolvedValue([
      { code: 'first_dream', target: 1, badgeId: 'b1' }
    ]);
    missionRepository.getUserMission.mockResolvedValue({ progress: 1, completedAt: '2025-10-31' });
    dreamNodeRepository.countUserNodes.mockResolvedValue(1);
    dreamNodeRepository.getUserNodes.mockResolvedValue([]);

    const badges = await missionService.onDreamSaved('user');
    expect(badges).toEqual([]);
  });

  it('should unlock badge for event mission via onDreamReinterpreted', async () => {
    missionRepository.getAllMissions.mockResolvedValue([
      { code: 'reflective_interpreter', target: 1, badgeId: 'b3' }
    ]);
    missionRepository.getUserMission.mockResolvedValue({ progress: 0, completedAt: null });
    badgeRepository.getBadgeById.mockResolvedValue({ id: 'b3' });

    const badges = await missionService.onDreamReinterpreted('user');
    expect(badges).toEqual([{ id: 'b3' }]);
    expect(badgeRepository.awardBadge).toHaveBeenCalledWith('user', 'b3');
  });

  it('should not unlock badge for event mission if not completed via onDreamReinterpreted', async () => {
    missionRepository.getAllMissions.mockResolvedValue([
      { code: 'reflective_interpreter', target: 2, badgeId: 'b3' }
    ]);
    missionRepository.getUserMission.mockResolvedValue({ progress: 0, completedAt: null });

    const badges = await missionService.onDreamReinterpreted('user');
    expect(badges).toEqual([]);
  });

  it('should unlock badge for streak mission via onDreamSaved', async () => {
    missionRepository.getAllMissions.mockResolvedValue([
      { code: 'constant_dreamer', target: 3, badgeId: 'b2' }
    ]);
    missionRepository.getUserMission.mockResolvedValue({ progress: 2, completedAt: null });
    badgeRepository.getBadgeById.mockResolvedValue({ id: 'b2' });
    dreamNodeRepository.countUserNodes.mockImplementation((_profileId: any, filters: any) => {
      if (filters && filters.from && filters.to &&
        filters.from.startsWith('2025-11-01') && filters.to.startsWith('2025-11-02')) {
        return Promise.resolve(1);
      }
      return Promise.resolve(5);
    });
    dreamNodeRepository.getUserNodes.mockResolvedValue([
      { creationDate: '2025-11-01T00:00:00.000Z' },
      { creationDate: '2025-10-31T00:00:00.000Z' },
      { creationDate: '2025-10-30T00:00:00.000Z' }
    ]);

    const badges = await missionService.onDreamSaved('user');
    expect(badges).toEqual([{ id: 'b2' }]);
    expect(badgeRepository.awardBadge).toHaveBeenCalledWith('user', 'b2');
  });
});
