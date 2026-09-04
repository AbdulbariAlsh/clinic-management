import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Roles('FRONT_DESK')
  @Post()
  create(@Body() body: { name: string; phone: string; medicalHistory?: string }) {
    return this.patientsService.create(body);
  }

  @Roles('ADMIN', 'DOCTOR', 'PHARMACIST')
  @Get()
  findAll() {
    return this.patientsService.findAll();
  }

  @Roles('ADMIN', 'DOCTOR', 'PHARMACIST')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.patientsService.findOne(id);
  }

  @Roles('FRONT_DESK')
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: { name?: string; phone?: string; medicalHistory?: string }) {
    return this.patientsService.update(id, body);
  }

  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.patientsService.remove(id);
  }
}
