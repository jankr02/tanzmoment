import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CustomerQueryDto } from './dto/customer-query.dto';
import {
  CustomerListResponseDto,
  CustomerListItemDto,
  CustomerDetailDto,
  CustomerNoteDto,
} from './dto/customer-response.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class AdminCustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: CustomerQueryDto): Promise<CustomerListResponseDto> {
    const { page = 1, limit = 20, search } = query;
    const skip = (page - 1) * limit;

    const where = this.buildWhereClause(search);

    const [total, users] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { bookings: true } },
          bookings: {
            select: { createdAt: true },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      }),
    ]);

    const data: CustomerListItemDto[] = users.map((u) => ({
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      phone: u.phone,
      bookingCount: u._count.bookings,
      lastActivity: u.bookings[0]?.createdAt ?? null,
      isActive: u.isActive,
      createdAt: u.createdAt,
    }));

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string): Promise<CustomerDetailDto> {
    const user = await this.prisma.user.findFirst({
      where: { id, role: UserRole.CUSTOMER },
      include: {
        _count: { select: { bookings: true } },
        bookings: {
          orderBy: { createdAt: 'desc' },
          include: {
            course: { select: { id: true, title: true, slug: true } },
            session: {
              select: {
                id: true,
                startTime: true,
                location: { select: { name: true } },
              },
            },
            payment: {
              select: { amountInCents: true, status: true, paidAt: true },
            },
          },
        },
        customerNotes: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!user) {
      throw new NotFoundException(`Customer with id ${id} not found`);
    }

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      bookingCount: user._count.bookings,
      lastActivity: user.bookings[0]?.createdAt ?? null,
      isActive: user.isActive,
      createdAt: user.createdAt,
      bookings: user.bookings.map((b) => ({
        id: b.id,
        status: b.status,
        course: b.course,
        session: b.session
          ? {
              id: b.session.id,
              startTime: b.session.startTime,
              locationName: b.session.location?.name ?? '',
            }
          : null,
        payment: b.payment ?? null,
        createdAt: b.createdAt,
      })),
      notes: user.customerNotes.map((n) => ({
        id: n.id,
        content: n.content,
        createdBy: n.createdBy,
        createdAt: n.createdAt,
      })),
    };
  }

  async addNote(
    customerId: string,
    content: string,
    createdBy: string,
  ): Promise<CustomerNoteDto> {
    const user = await this.prisma.user.findFirst({
      where: { id: customerId, role: UserRole.CUSTOMER },
    });
    if (!user) {
      throw new NotFoundException(`Customer with id ${customerId} not found`);
    }

    const note = await this.prisma.customerNote.create({
      data: { userId: customerId, content, createdBy },
    });

    return {
      id: note.id,
      content: note.content,
      createdBy: note.createdBy,
      createdAt: note.createdAt,
    };
  }

  async deleteNote(noteId: string): Promise<void> {
    const note = await this.prisma.customerNote.findUnique({
      where: { id: noteId },
    });
    if (!note) {
      throw new NotFoundException(`Note with id ${noteId} not found`);
    }
    await this.prisma.customerNote.delete({ where: { id: noteId } });
  }

  private buildWhereClause(search?: string) {
    const baseWhere = { role: UserRole.CUSTOMER };
    if (!search) return baseWhere;

    return {
      ...baseWhere,
      OR: [
        { firstName: { contains: search, mode: 'insensitive' as const } },
        { lastName: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } },
      ],
    };
  }
}
