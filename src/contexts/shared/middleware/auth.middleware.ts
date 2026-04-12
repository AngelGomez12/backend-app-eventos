import type { FastifyReply, FastifyRequest } from "fastify";

import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from "@nestjs/common";

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: FastifyRequest["raw"], res: FastifyReply["raw"], next: () => void) {
    // Permitir preflight requests para CORS
    if (req.method === "OPTIONS") {
      // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
      return next();
    }

    const authHeader = req.headers.authorization;

    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedException(
        "Missing or invalid authorization header",
      );
    }

    // Nota: Si necesitas validar/decodificar el token para agregar el usuario
    // a la request, deberías hacerlo a través de un Guard (como tu JwtStrategy)
    // o inyectar JwtService aquí. Este middleware por ahora corrobora que
    // el formato sea válido antes de llegar a los endpoints.

    next();
  }
}
