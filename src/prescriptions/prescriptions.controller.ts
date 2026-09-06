import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, UseInterceptors } from '@nestjs/common';
import { PrescriptionsService } from './prescriptions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Audit } from '../audit-log/audit.decorator';
import { AuditInterceptor } from '../audit-log/audit.interceptor';

@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(AuditInterceptor)
@Controller('prescriptions')
export class PrescriptionsController {
  constructor(private readonly prescriptionsService: PrescriptionsService) {}

  @Roles('DOCTOR')
  @Audit('CREATE', 'Prescription')
  @Post()
  create(@Body() body: { appointmentId: string; drugs: string; instructions: string }) {
    return this.prescriptionsService.create(body);
  }

  @Roles('ADMIN', 'DOCTOR', 'PHARMACIST')
  @Get()
  findAll() {
    return this.prescriptionsService.findAll();
  }

  @Roles('ADMIN', 'DOCTOR', 'PHARMACIST')
  @Audit('READ', 'Prescription')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.prescriptionsService.findOne(id);
  }

  @Roles('DOCTOR')
  @Audit('UPDATE', 'Prescription')
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: { drugs?: string; instructions?: string }) {
    return this.prescriptionsService.update(id, body);
  }

  @Roles('DOCTOR')
  @Audit('DELETE', 'Prescription')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.prescriptionsService.remove(id);
  }
}
