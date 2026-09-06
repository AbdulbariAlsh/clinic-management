import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AppointmentsService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    patientId: string;
    doctorId: string;
    frontDeskId: string;
    notes?: string;
    price: number;
    dateTime: string;
  }) {
    return this.prisma.appointment.create({
      data: {
        notes: data.notes,
        price: data.price,
        dateTime: new Date(data.dateTime),
        patient: { connect: { id: data.patientId } },
        doctor: { connect: { id: data.doctorId } },
        frontDesk: { connect: { id: data.frontDeskId } },
      },
    });
  }

  async findAll() {
    return this.prisma.appointment.findMany({
      include: {
        patient: true,
        doctor: { select: { id: true, name: true, email: true, role: true } },
        frontDesk: { select: { id: true, name: true, email: true, role: true } },
      },
    });
  }

  async findOne(id: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: true,
        doctor: { select: { id: true, name: true, email: true, role: true } },
        frontDesk: { select: { id: true, name: true, email: true, role: true } },
      },
    });
    if (!appointment) throw new NotFoundException('Appointment not found');
    return appointment;
  }

  async update(id: string, data: { notes?: string; price?: number; dateTime?: string }) {
    await this.findOne(id);
    return this.prisma.appointment.update({
      where: { id },
      data: {
        ...data,
        ...(data.dateTime && { dateTime: new Date(data.dateTime) }),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.appointment.delete({
      where: { id },
    });
  }
}
