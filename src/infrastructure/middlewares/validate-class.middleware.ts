import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { NextFunction, Request, Response } from "express";

export function validateBody(dtoClass: any) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.is('application/json')) {
      res.status(400).json({
        message: "Errores de validación",
        errors: [
          {
            field: "body",
            messages: ["El cuerpo de la solicitud debe ser un JSON válido"],
          },
        ],
      });
      return;
    }

    const dto = plainToInstance(dtoClass, req.body);

    const errors = await validate(dto);
    if (errors.length > 0) {
      return res.status(400).json({
        message: "Invalid data",
        errors: errors.map((err) => ({
          field: err.property,
          messages: Object.values(err.constraints || {}),
        })),
      });
    }

    req.body = dto;
    next();
  };
}

export function validateParams(dtoClass: any) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const dto: any = plainToInstance(dtoClass, req.params);

    const errors = await validate(dto);
    if (errors.length > 0) {
      return res.status(400).json({
        message: "Invalid params",
        errors: errors.map((err) => ({
          field: err.property,
          messages: Object.values(err.constraints || {}),
        })),
      });
    }

    req.params = dto;
    next();
  };
}

export function validateQuery(dtoClass: any) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const dto: any = plainToInstance(dtoClass, req.query);

    const errors = await validate(dto);
    if (errors.length > 0) {
      return res.status(400).json({
        message: "Invalid query parameters",
        errors: errors.map((err) => ({
          field: err.property,
          messages: Object.values(err.constraints || {}),
        })),
      });
    }

    req.query = dto;
    next();
  };
}
