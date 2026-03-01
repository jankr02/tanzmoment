import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { AdminOnly } from '../../auth/decorators/admin-only.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AdminCustomersService } from './admin-customers.service';
import { CustomerQueryDto } from './dto/customer-query.dto';
import { CreateNoteDto } from './dto/create-note.dto';
import {
  CustomerListResponseDto,
  CustomerDetailDto,
  CustomerNoteDto,
} from './dto/customer-response.dto';

@ApiTags('Admin - Customers')
@Controller('admin/customers')
@AdminOnly()
export class AdminCustomersController {
  constructor(private readonly customersService: AdminCustomersService) {}

  @Get()
  @ApiOperation({ summary: 'List all customers with pagination and search' })
  @ApiResponse({ status: 200, type: CustomerListResponseDto })
  async findAll(
    @Query() query: CustomerQueryDto,
  ): Promise<CustomerListResponseDto> {
    return this.customersService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get customer profile with booking history and notes' })
  @ApiParam({ name: 'id', description: 'Customer user ID' })
  @ApiResponse({ status: 200, type: CustomerDetailDto })
  async findOne(@Param('id') id: string): Promise<CustomerDetailDto> {
    return this.customersService.findById(id);
  }

  @Post(':id/notes')
  @ApiOperation({ summary: 'Add a note to a customer profile' })
  @ApiParam({ name: 'id', description: 'Customer user ID' })
  @ApiResponse({ status: 201, type: CustomerNoteDto })
  async addNote(
    @Param('id') customerId: string,
    @Body() dto: CreateNoteDto,
    @CurrentUser() admin: { id: string },
  ): Promise<CustomerNoteDto> {
    return this.customersService.addNote(customerId, dto.content, admin.id);
  }
}

@ApiTags('Admin - Customers')
@Controller('admin/customer-notes')
@AdminOnly()
export class AdminCustomerNotesController {
  constructor(private readonly customersService: AdminCustomersService) {}

  @Delete(':noteId')
  @ApiOperation({ summary: 'Delete a customer note' })
  @ApiParam({ name: 'noteId', description: 'Note ID' })
  @ApiResponse({ status: 204 })
  async deleteNote(@Param('noteId') noteId: string): Promise<void> {
    return this.customersService.deleteNote(noteId);
  }
}
