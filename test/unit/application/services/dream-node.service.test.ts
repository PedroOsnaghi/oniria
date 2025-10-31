import { DreamNodeService } from "../../../../src/application/services/dream-node.service";
import { IDreamNodeRepository } from "../../../../src/domain/repositories/dream-node.repository";
import { SaveDreamNodeRequestDto } from "../../../../src/infrastructure/dtos/dream-node";
import { DreamContext } from "../../../../src/domain/interfaces/interpretation-dream.interface";

jest.mock("../../../../src/config/envs", () => ({
  envs: {
    SUPABASE_URL: "https://mock.supabase.co",
  },
}));

describe("DreamNodeService - saveDreamNode", () => {
  let service: DreamNodeService;
  let mockRepository: jest.Mocked<IDreamNodeRepository>;

  let dreamContext: DreamContext;

  beforeEach(() => {
    mockRepository = {
      save: jest.fn().mockResolvedValue({ 
        data: { id: "mocked-id" }, 
        error: null 
      }),
      getUserNodes: jest.fn(),
      countUserNodes: jest.fn(),
      addDreamContext: jest.fn().mockResolvedValue({}),
    } as unknown as jest.Mocked<IDreamNodeRepository>;

    service = new DreamNodeService(mockRepository);
    dreamContext = {
      themes: [],
      people: [],
      locations: [],
      emotions_context: []
    };
  });

  it("should save a dreamNode correctly with valid imageUrl", async () => {
    const userId = "user123";
    const node: SaveDreamNodeRequestDto = {
      title: "Sueño de prueba",
      description: "Descripción del sueño",
      interpretation: "Interpretación del sueño",
      emotion: "felicidad",
      imageUrl: "https://mock.supabase.co/storage/v1/object/public/image1.jpg",
      dreamType: "Estandar"
    };

    await service.saveDreamNode(userId, node, dreamContext);

    expect(mockRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        title: node.title,
        dream_description: node.description,
        interpretation: node.interpretation,
        emotion: expect.stringMatching(/felicidad/i),
        privacy: "Privado",
        state: "Activo",
        imageUrl: node.imageUrl,
        creationDate: expect.any(Date),
        type: "Estandar"
      }),
      userId,
      "Estandar"
    );
  });

  it("should clean imageUrl if it’s invalid", async () => {
    const userId = "user123";
    const node: SaveDreamNodeRequestDto = {
      title: "Sueño sin imagen válida",
      description: "Descripción del sueño",
      interpretation: "Interpretación del sueño",
      emotion: "miedo",
      imageUrl: "https://otro-servidor.com/imagen.jpg",
      dreamType: "Estandar"
    };

    await service.saveDreamNode(userId, node, dreamContext);

    expect(mockRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        title: node.title,
        dream_description: node.description,
        emotion: node.emotion,
        privacy: "Privado",
        state: "Activo",
        imageUrl: "",
        interpretation: node.interpretation,
        creationDate: expect.any(Date),
        type: "Estandar"
      }),
      userId,
      "Estandar"
    );
  });

  it("should handle missing imageUrl gracefully", async () => {
    const userId = "user123";
    const node: SaveDreamNodeRequestDto = {
      title: "Sueño sin imagen",
      description: "Sin imagen",
      interpretation: "Nada relevante",
      emotion: "tristeza",
      imageUrl: "",
      dreamType: "Estandar"
    };

    await service.saveDreamNode(userId, node, dreamContext);

    expect(mockRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        title: node.title,
        dream_description: node.description,
        emotion: node.emotion,
        privacy: "Privado",
        state: "Activo",
        imageUrl: node.imageUrl,
        interpretation: node.interpretation,
        creationDate: expect.any(Date),
        type: "Estandar"
      }),
      userId,
      "Estandar"
    );
  });

  it("should throw an error if the repository fails", async () => {
    const userId = "user123";
    const node: SaveDreamNodeRequestDto = {
      title: "Sueño con error",
      description: "Descripción del sueño",
      interpretation: "Interpretación del sueño",
      emotion: "enojo",
      imageUrl: "https://mock.supabase.co/storage/v1/object/public/image2.jpg",
      dreamType: "Estandar"
    };

    mockRepository.save.mockRejectedValue(new Error("Error en DB"));
    await expect(service.saveDreamNode(userId, node, dreamContext)).rejects.toThrow(
      "Error en DB"
    );
  });
});
