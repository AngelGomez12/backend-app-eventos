import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<any>();
    const request = ctx.getRequest<any>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse: any =
      exception instanceof HttpException
        ? exception.getResponse()
        : { message: "Internal server error" };

    const message =
      typeof exceptionResponse === "object"
        ? exceptionResponse.message || "Operation failed"
        : exceptionResponse;

    const errors =
      typeof exceptionResponse === "object" ? exceptionResponse.error : null;

    const errorResponse = {
      success: false,
      message: Array.isArray(message) ? message[0] : message,
      data: null,
      errors: Array.isArray(message) ? message : errors,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `${request.method} ${request.url}`,
        exception instanceof Error
          ? exception.stack
          : JSON.stringify(exception),
      );
    } else {
      this.logger.warn(
        `${request.method} ${request.url} - Status: ${status} - Message: ${JSON.stringify(message)}`,
      );
    }

    // Lógica ultra-robusta para enviar la respuesta en Fastify, Express o Node.js puro
    if (typeof response.code === 'function') {
      // Fastify estándar
      return response.code(status).send(errorResponse);
    } else if (typeof response.status === 'function') {
      // Express estándar o adaptador compatible
      return response.status(status).send(errorResponse);
    } else {
      // Node.js nativo (ServerResponse) como último recurso
      const res = response.raw || response;
      res.statusCode = status;
      if (!res.headersSent) {
        res.setHeader('Content-Type', 'application/json');
      }
      return res.end(JSON.stringify(errorResponse));
    }
  }
}
