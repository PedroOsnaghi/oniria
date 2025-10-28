import { DreamNodeService } from "../../../../src/application/services/dream-node.service";
import { IDreamNodeRepository } from "../../../../src/domain/repositories/dream-node.repository";
import { SaveDreamNodeRequestDto } from "../../../../src/infrastructure/dtos/dream-node";

jest.mock("../../../../src/config/envs", () => ({
  envs: {
    SUPABASE_URL: "https://mock.supabase.co",
  },
}));

describe("DreamNodeService - saveDreamNode", () => {
  let service: DreamNodeService;
  let mockRepository: jest.Mocked<IDreamNodeRepository>;

  beforeEach(() => {
    mockRepository = {
      save: jest.fn().mockResolvedValue({ id: "mocked-id" }),
      getUserNodes: jest.fn(),
      countUserNodes: jest.fn(),
      addDreamContext: jest.fn(),
    } as unknown as jest.Mocked<IDreamNodeRepository>;

    service = new DreamNodeService(mockRepository);
  });

  it("should save a dreamNode correctly with valid imageUrl", async () => {
    const userId = "user123";
    const node: SaveDreamNodeRequestDto = {
      title: "Sueño de prueba",
      description: "Descripción del sueño",
      interpretation: "Interpretación del sueño",
      emotion: "felicidad",
      imageUrl: "https://mock.supabase.co/storage/v1/object/public/image1.jpg",
      themes: [],
      people: [],
      locations: [],
      emotions_context: [],
    };

    await service.saveDreamNode(userId, node);

    expect(mockRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        title: node.title,
        dream_description: node.description,
        interpretation: node.interpretation,
        dream_emotion: "Felicidad",
        dream_privacy: "Privado",
        dream_state: "Activo",
        imageUrl: node.imageUrl,
        creationDate: expect.any(Date),
      }),
      userId
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
      themes: [],
      people: [],
      locations: [],
      emotions_context: [],
    };

    await service.saveDreamNode(userId, node);

    expect(mockRepository.save).toHaveBeenCalledWith(
  expect.objectContaining({
    title: node.title,
    dream_description: node.description,
    dream_emotion: node.emotion.charAt(0).toUpperCase() + node.emotion.slice(1),
    dream_privacy: "Privado",
    dream_state: "Activo",
    imageUrl: "",
    interpretation: node.interpretation,
    creationDate: expect.any(Date),
  }),
  userId
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
      themes: [],
      people: [],
      locations: [],
      emotions_context: [],
    };

    await service.saveDreamNode(userId, node);

    expect(mockRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        title: node.title,
        dream_description: node.description,
        dream_emotion:
          node.emotion.charAt(0).toUpperCase() + node.emotion.slice(1),
        dream_privacy: "Privado",
        dream_state: "Activo",
        imageUrl: node.imageUrl,
        interpretation: node.interpretation,
        creationDate: expect.any(Date),
      }),
      userId
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
      themes: [],
      people: [],
      locations: [],
      emotions_context: [],
    };

    mockRepository.save.mockRejectedValue(new Error("Error en DB"));

    await expect(service.saveDreamNode(userId, node)).rejects.toThrow(
      "Error en DB"
    );
  });
});
