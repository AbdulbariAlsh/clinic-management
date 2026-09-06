import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditLogService {
  constructor(private prisma: PrismaService) {}

  async log(data: {
    userId: string;
    action: string;
    entity: string;
    entityId: string;
    dataBefore?: string;
    dataAfter?: string;
  }) {
    return this.prisma.auditLog.create({
      data,
    });
  }
}
