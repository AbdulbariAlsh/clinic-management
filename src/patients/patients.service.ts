import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PatientsService {
  constructor(private prisma: PrismaService) {}

  async create(data: { name: string; phone: string; medicalHistory?: string }) {
    return this.prisma.patient.create({
      data,
    });
  }

  async findAll() {
    return this.prisma.patient.findMany({
      where: { isActive: true },
    });
  }

  async findOne(id: string) {
    const patient = await this.prisma.patient.findFirst({
      where: { id, isActive: true },
    });
    if (!patient) throw new NotFoundException('Patient not found');
    return patient;
  }

  async update(id: string, data: { name?: string; phone?: string; medicalHistory?: string }) {
    await this.findOne(id);
    return this.prisma.patient.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.patient.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
