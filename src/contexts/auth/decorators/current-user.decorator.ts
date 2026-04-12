import { createParamDecorator, ExecutionContext } from "@nestjs/common";

import { RequestWithUser } from "@/contexts/auth/decorators/current-tenant.decorator";

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    return request.user;
  },
);
