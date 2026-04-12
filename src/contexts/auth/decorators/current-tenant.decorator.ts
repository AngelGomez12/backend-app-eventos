import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export interface RequestWithUser {
  user?: {
    tenantId?: string;
    id?: string;
    email?: string;
    role?: string;
  };
}

export const CurrentTenant = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    return request.user?.tenantId;
  },
);
