import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, UseInterceptors } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Audit } from '../audit-log/audit.decorator';
import { AuditInterceptor } from '../audit-log/audit.interceptor';

@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(AuditInterceptor)
@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Roles('FRONT_DESK')
  @Audit('CREATE', 'Patient')
  @Post()
  create(@Body() body: { name: string; phone: string; medicalHistory?: string }) {
    return this.patientsService.create(body);
  }

  @Roles('ADMIN', 'DOCTOR', 'PHARMACIST', 'FRONT_DESK')
  @Get()
  findAll() {
    return this.patientsService.findAll();
  }

  @Roles('ADMIN', 'DOCTOR', 'PHARMACIST', 'FRONT_DESK')
  @Audit('READ', 'Patient')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.patientsService.findOne(id);
  }

  @Roles('FRONT_DESK')
  @Audit('UPDATE', 'Patient')
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: { name?: string; phone?: string; medicalHistory?: string }) {
    return this.patientsService.update(id, body);
  }

  @Roles('ADMIN')
  @Audit('DELETE', 'Patient')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.patientsService.remove(id);
  }
}
