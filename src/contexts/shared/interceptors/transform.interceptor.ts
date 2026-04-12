import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

export interface Response<T> {
  data: T;
  message: string;
  success: boolean;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((response: any) => {
        // Si el response ya tiene una propiedad 'data', lo dejamos como está
        // y solo le sumamos los metadatos globales si no existen.
        if (response && typeof response === "object" && "data" in response) {
          return {
            ...response,
            message: response.message ?? "Operation successful",
            success: response.success ?? true,
          };
        }

        // Si no tiene 'data', lo envolvemos de forma estándar
        return {
          data: response,
          message: "Operation successful",
          success: true,
        };
      }),
    );
  }
}
