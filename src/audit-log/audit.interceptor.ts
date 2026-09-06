import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, tap } from 'rxjs';
import { AuditLogService } from './audit-log.service';
import { AUDIT_KEY } from './audit.decorator';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private reflector: Reflector,
    private auditLogService: AuditLogService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const auditMeta = this.reflector.get<{ action: string; entity: string }>(
      AUDIT_KEY,
      context.getHandler(),
    );

    if (!auditMeta) return next.handle();

    const request = context.switchToHttp().getRequest();
    const userId = request.user?.userId;
    const entityId = request.params?.id ?? 'N/A';
    const { action, entity } = auditMeta;

    return next.handle().pipe(
      tap((responseData) => {
        const dataAfter =
          action === 'DELETE' || action === 'READ'
            ? undefined
            : JSON.stringify(responseData);

        const dataBefore = undefined;

        this.auditLogService.log({
          userId,
          action,
          entity,
          entityId: responseData?.id ?? entityId,
          dataBefore,
          dataAfter,
        });
      }),
    );
  }
}
