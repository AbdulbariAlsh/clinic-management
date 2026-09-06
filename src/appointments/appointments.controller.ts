import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Request, UseInterceptors } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Audit } from '../audit-log/audit.decorator';
import { AuditInterceptor } from '../audit-log/audit.interceptor';

@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(AuditInterceptor)
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Roles('FRONT_DESK')
  @Audit('CREATE', 'Appointment')
  @Post()
  create(@Body() body: { patientId: string; doctorId: string; notes?: string; price: number; dateTime: string }, @Request() req) {
    return this.appointmentsService.create({
      ...body,
      frontDeskId: req.user.userId,
    });
  }

  @Roles('ADMIN', 'FRONT_DESK', 'DOCTOR')
  @Get()
  findAll() {
    return this.appointmentsService.findAll();
  }

  @Roles('ADMIN', 'FRONT_DESK', 'DOCTOR')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.appointmentsService.findOne(id);
  }

  @Roles('FRONT_DESK')
  @Audit('UPDATE', 'Appointment')
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: { notes?: string; price?: number; dateTime?: string }) {
    return this.appointmentsService.update(id, body);
  }

  @Roles('ADMIN', 'FRONT_DESK')
  @Audit('DELETE', 'Appointment')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.appointmentsService.remove(id);
  }
}
