import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AdminOnly } from '../auth/decorators/admin-only.decorator';
import { UploadResponseDto } from './dto/upload-response.dto';
import { UploadsService } from './uploads.service';

const NEWS_INLINE_MAX_WIDTH = 1200;
const NEWS_COVER_MAX_WIDTH = 1600;

@ApiTags('Admin - Uploads')
@Controller('admin/uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('news-image')
  @AdminOnly()
  @ApiOperation({ summary: 'Inline-Bild für News-Artikel hochladen' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
      required: ['file'],
    },
  })
  @ApiResponse({ status: 201, type: UploadResponseDto })
  @UseInterceptors(FileInterceptor('file'))
  async uploadInlineImage(@UploadedFile() file: Express.Multer.File): Promise<UploadResponseDto> {
    const result = await this.uploadsService.saveNewsImage(file, { maxWidth: NEWS_INLINE_MAX_WIDTH });
    return result;
  }

  @Post('news-cover')
  @AdminOnly()
  @ApiOperation({ summary: 'Coverbild für News-Artikel hochladen' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
      required: ['file'],
    },
  })
  @ApiResponse({ status: 201, type: UploadResponseDto })
  @UseInterceptors(FileInterceptor('file'))
  async uploadCover(@UploadedFile() file: Express.Multer.File): Promise<UploadResponseDto> {
    const result = await this.uploadsService.saveNewsImage(file, { maxWidth: NEWS_COVER_MAX_WIDTH });
    return result;
  }
}
