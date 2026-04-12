import type { FastifyReply, FastifyRequest } from "fastify";

import { Injectable, Logger, NestMiddleware } from "@nestjs/common";

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger("HTTP");

  use(req: FastifyRequest["raw"], res: FastifyReply["raw"], next: () => void) {
    const { method, url } = req;
    const userAgent = req.headers["user-agent"] ?? "";
    const startTime = Date.now();

    res.on("finish", () => {
      const { statusCode } = res;
      const contentLength = res.getHeader("content-length") ?? "";
      const responseTime = Date.now() - startTime;

      this.logger.log(
        `${method} ${url} ${statusCode} ${String(contentLength)} - ${userAgent} ${responseTime}ms`,
      );
    });

    next();
  }
}
