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
    // Si no es una petición HTTP (ej: WebSockets), lo ignoramos
    if (context.getType() !== "http") {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const { method, url, body, user, ip } = request;
    
    // Usamos headers directamente para evitar el error .get() si no es Express
    const userAgent = request.headers ? request.headers["user-agent"] : null;

    // Solo logueamos mutaciones (POST, PATCH, DELETE, PUT)
    const monitoredMethods = ["POST", "PATCH", "DELETE", "PUT"];
    
    if (!monitoredMethods.includes(method)) {
      return next.handle();
    }

    // Excluimos algunas rutas sensibles o ruidosas si es necesario
    const excludedPaths = ["/auth/login", "/health"];
    if (excludedPaths.some(path => url.includes(path))) {
      return next.handle();
    }

    return next.handle().pipe(
      tap(() => {
        // Determinamos la entidad basándonos en la URL (simplificado)
        const pathSegments = url.split("/").filter((s: string) => s);
        const entity = pathSegments[0] || "Unknown";
        
        // El ID de la entidad suele ser el segundo segmento si es un UUID o número
        const entityId = pathSegments[1] && pathSegments[1].length > 10 ? pathSegments[1] : null;

        this.auditLogService.create({
          userId: user?.sub || user?.id,
          userEmail: user?.email,
          tenantId: user?.tenantId,
          action: method,
          entity: entity.charAt(0).toUpperCase() + entity.slice(1),
          entityId,
          payload: method !== "DELETE" ? body : null,
          ipAddress: ip,
          userAgent,
        }).catch(err => console.error("Error saving audit log:", err));
      }),
    );
  }
}