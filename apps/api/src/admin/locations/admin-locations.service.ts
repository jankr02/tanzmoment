import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';

export interface LocationDto {
  id: string;
  name: string;
  address?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class AdminLocationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<LocationDto[]> {
    const locations = await this.prisma.location.findMany({
      orderBy: { name: 'asc' },
    });

    return locations.map((l) => ({
      id: l.id,
      name: l.name,
      address: l.address ?? undefined,
      isActive: l.isActive,
      createdAt: l.createdAt,
      updatedAt: l.updatedAt,
    }));
  }

  async create(dto: CreateLocationDto): Promise<LocationDto> {
    const location = await this.prisma.location.create({
      data: {
        name: dto.name,
        address: dto.address,
      },
    });

    return {
      id: location.id,
      name: location.name,
      address: location.address ?? undefined,
      isActive: location.isActive,
      createdAt: location.createdAt,
      updatedAt: location.updatedAt,
    };
  }

  async update(id: string, dto: UpdateLocationDto): Promise<LocationDto> {
    const existing = await this.prisma.location.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Location not found');
    }

    const data: Record<string, unknown> = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.address !== undefined) data.address = dto.address;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;

    const location = await this.prisma.location.update({
      where: { id },
      data,
    });

    return {
      id: location.id,
      name: location.name,
      address: location.address ?? undefined,
      isActive: location.isActive,
      createdAt: location.createdAt,
      updatedAt: location.updatedAt,
    };
  }
}
