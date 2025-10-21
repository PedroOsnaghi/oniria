import "reflect-metadata";
import { DreamNodeController } from "../../../../src/infrastructure/controllers/dream-node.controller";
import { InterpretationDreamService } from "../../../../src/application/services/interpretation-dream.service";
import { DreamNodeService } from "../../../../src/application/services/dream-node.service";
import { Interpretation } from "../../../../src/domain/models/interpretation-dream.model";
import { IDreamNode } from "../../../../src/domain/models/dream-node.model";
import { IPaginatedResult } from "../../../../src/domain/interfaces/pagination.interface";

jest.mock("uuid", () => ({
  v4: jest.fn(() => "mocked-uuid-123"),
}));
import { Request, Response } from "express";
import { mockSaveReq } from "../../mocks/mock-save-req";
import { mockSaveRes } from "../../mocks/mock-save-res";
import { IllustrationDreamService } from "../../../../src/application/services/illustration-dream.service";
import { userId } from "../../mocks/get-user-nodes.mock";

describe("DreamNodeController Integration Tests", () => {
  let controller: DreamNodeController;
  let mockInterpretationService: jest.Mocked<InterpretationDreamService>;
  let mockDreamNodeService: jest.Mocked<DreamNodeService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockIllustrationService: jest.Mocked<IllustrationDreamService>;

  beforeEach(() => {
    mockInterpretationService = {
      interpretDream: jest.fn(),
      reinterpretDream: jest.fn(),
    } as any;

    mockDreamNodeService = {
      saveDreamNode: jest.fn(),
      getDreamById: jest.fn(),
      getUserNodes: jest.fn(),
    } as any;

    mockIllustrationService = {
      generateIllustration: jest.fn(),
    } as any;

    mockRequest = {
      body: {},
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    controller = new DreamNodeController(
      mockInterpretationService,
      mockDreamNodeService,
      mockIllustrationService
    );
  });

  describe("DreamNodeController.reinterpret", () => {
    let mockReq: any;
    let mockRes: any;

    beforeEach(() => {
      mockReq = {
        body: {
          dreamId: "uuid-fake",
          description: "texto",
          previousInterpretation: "prev",
        },
      };
      mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      mockInterpretationService.reinterpretDream.mockResolvedValue({
        title: "Título mockeado",
        interpretation: "Interpretación mockeada",
        emotion: "Emoción mockeada",
      });
      
      // Mock the illustration service
      mockIllustrationService.generateIllustration.mockResolvedValue(
        "https://mock-illustration-url.com/image.jpg"
      );
    });

    it("debería reinterpretar un sueño correctamente", async () => {
      await controller.reinterpret(mockReq as Request, mockRes as Response);

      expect(mockInterpretationService.reinterpretDream).toHaveBeenCalledWith(
        "texto",
        "prev"
      );
      expect(mockIllustrationService.generateIllustration).toHaveBeenCalledWith("texto");
      expect(mockRes.json).toHaveBeenCalledWith({
        description: "texto",
        imageUrl: "https://mock-illustration-url.com/image.jpg",
        title: "Título mockeado",
        interpretation: "Interpretación mockeada",
        emotion: "Emoción mockeada",
      });
    });

    it("debería manejar errores al reinterpretar", async () => {
      mockInterpretationService.reinterpretDream.mockRejectedValueOnce(
        new Error("Error simulado")
      );

      await controller.reinterpret(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        errors: "Error al reinterpretar el sueño",
      });
    });
  });

  describe("DreamNodeController.save", () => {
    beforeEach(() => {
      mockDreamNodeService.saveDreamNode.mockReset();
    });

    it("should save a dream node and return 201", async () => {
      mockDreamNodeService.saveDreamNode.mockResolvedValue(undefined);
      (mockSaveReq as any).userId = "user123";

      await controller.save(
        mockSaveReq as Request,
        mockSaveRes as unknown as Response
      );

      expect(mockDreamNodeService.saveDreamNode).toHaveBeenCalledWith("user123", {
        userId: "user123",
        title: mockSaveReq.body.title,
        description: mockSaveReq.body.description,
        interpretation: mockSaveReq.body.interpretation,
        emotion: mockSaveReq.body.emotion,
        imageUrl: mockSaveReq.body.imageUrl ?? "",
      });

      expect(mockSaveRes.status).toHaveBeenCalledWith(201);
      expect(mockSaveRes.json).toHaveBeenCalledWith({
        message: "Nodo de sueño guardado exitosamente",
        errors: [],
      });
    });

    it("should return 500 when service fails", async () => {
      mockDreamNodeService.saveDreamNode.mockRejectedValue(
        new Error("Error simulado")
      );
      (mockSaveReq as any).userId = "user123";

      await controller.save(
        mockSaveReq as Request,
        mockSaveRes as unknown as Response
      );

      expect(mockDreamNodeService.saveDreamNode).toHaveBeenCalledWith("user123", {
        userId: "user123",
        title: mockSaveReq.body.title,
        description: mockSaveReq.body.description,
        interpretation: mockSaveReq.body.interpretation,
        emotion: mockSaveReq.body.emotion,
        imageUrl: mockSaveReq.body.imageUrl ?? "",
      });

      expect(mockSaveRes.status).toHaveBeenCalledWith(500);
      expect(mockSaveRes.json).toHaveBeenCalledWith({
        message: "Error interno del servidor",
        errors: ["Error simulado"],
      });
    });
  });

  describe("DreamNodeController.getUserNodes", () => {
    let mockRequest: Partial<Request> & {
      validatedQuery?: any;
      userId?: string;
    };
    let mockResponse: Partial<Response>;

    beforeEach(() => {
      mockRequest = {};
      mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };
    });

    it("should return paginated result with filters and pagination", async () => {
      const userId = "mocked-user-id";
      const filters = {
        state: "Activo",
        privacy: "Publico",
        emotion: "Felicidad",
        search: "test",
      };
      const pagination = { page: 1, limit: 10 };
      const mockDreamNode: IDreamNode = {
        id: "dream-node-id",
        title: "Test Dream",
        description: "Test Description",
        interpretation: "Test Interpretation",
        privacy: "Publico",
        state: "Activo",
        emotion: "Felicidad",
        creationDate: new Date(),
      };
      const expectedResult: IPaginatedResult<IDreamNode> = {
        data: [mockDreamNode],
        pagination: {
          currentPage: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      mockRequest.validatedQuery = { ...filters, ...pagination };
      mockRequest.userId = userId;
      mockDreamNodeService.getUserNodes.mockResolvedValue(expectedResult);

      await controller.getUserNodes(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockDreamNodeService.getUserNodes).toHaveBeenCalledWith(
        userId,
        filters,
        pagination
      );
      expect(mockResponse.json).toHaveBeenCalledWith(expectedResult);
    });

    it("should return 400 when userId is missing", async () => {
      mockRequest.userId = "";

      await controller.getUserNodes(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        errors: "El id del usuario es requerido",
      });
    });

    it("should return 500 when service throws an error", async () => {
      const userId = "mocked-user-id";
      const filters = {
        state: "Activo",
        privacy: "Publico",
        emotion: "Felicidad",
        search: "test",
      };
      const pagination = { page: 1, limit: 10 };

      mockRequest.userId = userId;
      mockRequest.validatedQuery = { ...filters, ...pagination };
      mockDreamNodeService.getUserNodes.mockRejectedValue(
        new Error("Service error")
      );

      await controller.getUserNodes(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockDreamNodeService.getUserNodes).toHaveBeenCalledWith(
        userId,
        filters,
        pagination
      );
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        errors: "Error al obtener los nodos de sueño del usuario",
      });
    });
  });
});