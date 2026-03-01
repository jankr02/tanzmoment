import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { AdminOnly } from '../../auth/decorators/admin-only.decorator';
import { AdminLocationsService, LocationDto } from './admin-locations.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';

@ApiTags('Admin - Locations')
@Controller('admin/locations')
@AdminOnly()
export class AdminLocationsController {
  constructor(private readonly locationsService: AdminLocationsService) {}

  @Get()
  @ApiOperation({ summary: 'List all locations' })
  @ApiResponse({ status: 200 })
  async findAll(): Promise<LocationDto[]> {
    return this.locationsService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Create a new location' })
  @ApiResponse({ status: 201 })
  async create(@Body() dto: CreateLocationDto): Promise<LocationDto> {
    return this.locationsService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a location' })
  @ApiParam({ name: 'id', description: 'Location ID' })
  @ApiResponse({ status: 200 })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateLocationDto,
  ): Promise<LocationDto> {
    return this.locationsService.update(id, dto);
  }
}
