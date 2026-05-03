import { ApiProperty } from '@nestjs/swagger';

export class UploadResponseDto {
  @ApiProperty({ example: '/uploads/news/2026/05/abc123.webp' })
  url!: string;

  @ApiProperty({ example: 1600 })
  width!: number;

  @ApiProperty({ example: 900 })
  height!: number;

  @ApiProperty({ example: 84231 })
  bytes!: number;

  @ApiProperty({ example: 'webp' })
  format!: string;
}
