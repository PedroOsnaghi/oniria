import { NextFunction, Request, Response } from "express";
import { supabase } from "../../config/supabase"; 
import { envs } from "../../config/envs";
import jwt from "jsonwebtoken";
import { JwtPayload } from "@supabase/supabase-js";

export async function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    // ======= Nuevo enfoque: verificar token directamente con Supabase =======
    // const { data: userData, error } = await supabase.auth.getUser(token);

    // if (error || !userData.user) {
    //   console.error("JWT verification failed via Supabase:", error);
    //   return res.status(403).json({ message: "Forbidden" });
    // }

    // (req as any).userId = userData.user.id;
    // next();

    // ======= Código previo (verificación manual JWT) =======
    
    const secret = envs.SUPABASE_JWT_SECRET;
    const url = envs.SUPABASE_URL;

    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        console.error("JWT verification failed:", err);
        return res.status(403).json({ message: "Forbidden" });
      }
      const payload = decoded as JwtPayload;

      if (!payload.iss?.includes(url)) {
        return res.status(403).json({ message: "Invalid issuer"});
      }

      (req as any).userId = payload.sub;

      next();
    });
  } catch (err) {
    console.error("Unexpected error in authenticateToken:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}