import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { AuditLogService } from "../domain/audit-log.service";

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly auditLogService: AuditLogService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() !== "http") {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const { method, url, body, ip } = request;
    
    // Aseguramos que userAgent sea un string
    const rawUserAgent = request.headers ? request.headers["user-agent"] : null;
    const userAgent = Array.isArray(rawUserAgent) ? rawUserAgent.join(", ") : rawUserAgent;

    const monitoredMethods = ["POST", "PATCH", "DELETE", "PUT"];
    if (!monitoredMethods.includes(method)) {
      return next.handle();
    }

    const excludedPaths = ["/auth/login", "/health"];
    if (excludedPaths.some(path => url.includes(path))) {
      return next.handle();
    }

    return next.handle().pipe(
      tap(() => {
        const user = request.user;
        const pathSegments = url.split("?")[0].split("/").filter((s: string) => s);
        const entity = pathSegments[0] || "Unknown";
        const entityId = pathSegments[1] && pathSegments[1].length > 10 ? pathSegments[1] : null;

        this.auditLogService.create({
          userId: user?.sub || user?.id || user?.userId,
          userEmail: user?.email,
          tenantId: user?.tenantId,
          action: method,
          entity: entity.charAt(0).toUpperCase() + entity.slice(1),
          entityId,
          payload: method !== "DELETE" ? body : null,
          ipAddress: ip,
          userAgent: userAgent || null,
        }).catch(err => console.error("Error saving audit log:", err));
      }),
    );
  }
}