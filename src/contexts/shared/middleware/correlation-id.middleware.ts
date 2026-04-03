import { randomUUID } from "node:crypto";

import { Injectable, NestMiddleware } from "@nestjs/common";
import type { FastifyRequest, FastifyReply } from "fastify";

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(
    req: FastifyRequest["raw"] & { correlationId?: string },
    res: FastifyReply["raw"],
    next: () => void,
  ) {
    const correlationId =
      (req.headers["x-correlation-id"] as string) || randomUUID();

    req.headers["x-correlation-id"] = correlationId;
    req.correlationId = correlationId;

    res.setHeader("x-correlation-id", correlationId);

    next();
  }
}
