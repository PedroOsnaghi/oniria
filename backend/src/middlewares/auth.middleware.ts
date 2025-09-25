import { JWTPayload, jwtVerify } from "jose";
import { NextFunction, Request, Response } from "express";
import { envs } from "../config/envs";

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "No se encontró el token" });
  }

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(envs.SUPABASE_JWT_SECRET)
    );
    req.user = payload;
    console.log("payload: ", payload);
    next();
  } catch (error) {
    return res.status(401).json({ error: "Token invalido" });
  }
}
