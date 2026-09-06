import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrescriptionsService {
  constructor(private prisma: PrismaService) {}

  async create(data: { appointmentId: string; drugs: string; instructions: string }) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: data.appointmentId },
    });
    if (!appointment) throw new NotFoundException('Appointment not found');

    const existing = await this.prisma.prescription.findUnique({
      where: { appointmentId: data.appointmentId },
    });
    if (existing) throw new BadRequestException('A prescription already exists for this appointment');

    return this.prisma.prescription.create({
      data: {
        drugs: data.drugs,
        instructions: data.instructions,
        appointment: { connect: { id: data.appointmentId } },
      },
    });
  }

  async findAll() {
    return this.prisma.prescription.findMany({
      include: {
        appointment: {
          include: {
            patient: true,
            doctor: { select: { id: true, name: true, email: true, role: true } },
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const prescription = await this.prisma.prescription.findUnique({
      where: { id },
      include: {
        appointment: {
          include: {
            patient: true,
            doctor: { select: { id: true, name: true, email: true, role: true } },
          },
        },
      },
    });
    if (!prescription) throw new NotFoundException('Prescription not found');
    return prescription;
  }

  async update(id: string, data: { drugs?: string; instructions?: string }) {
    await this.findOne(id);
    return this.prisma.prescription.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.prescription.delete({
      where: { id },
    });
  }
}
