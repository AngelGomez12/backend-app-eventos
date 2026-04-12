import { Controller, Get, HttpCode, Inject, Logger } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

@ApiTags("Health")
@Controller("health")
export class HealthController {
  constructor(@Inject(Logger) private readonly logger: Logger) {}

  @Get()
  @HttpCode(200)
  @ApiOperation({
    summary: "Check service health",
    description:
      "Returns the current status of the service to verify it is up and running.",
  })
  @ApiOkResponse({
    description: "Service is healthy.",
    schema: { example: { status: "ok" } },
  })
  run() {
    this.logger.log("Health endpoint called!");
    return { status: "ok" };
  }
}
