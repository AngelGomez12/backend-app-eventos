import { Injectable, NestMiddleware, Logger } from "@nestjs/common";
import type { FastifyRequest, FastifyReply } from "fastify";

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger("HTTP");

  use(req: FastifyRequest["raw"], res: FastifyReply["raw"], next: () => void) {
    const { method, url } = req;
    const userAgent = req.headers["user-agent"] || "";
    const startTime = Date.now();

    res.on("finish", () => {
      const { statusCode } = res;
      const contentLength = res.getHeader("content-length") || "";
      const responseTime = Date.now() - startTime;

      this.logger.log(
        `${method} ${url} ${statusCode} ${contentLength} - ${userAgent} ${responseTime}ms`,
      );
    });

    next();
  }
}
