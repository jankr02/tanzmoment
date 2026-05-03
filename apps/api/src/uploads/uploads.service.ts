import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import sharp from 'sharp';
import { STORAGE_DRIVER, StorageDriver, StoredFile } from './storage/storage-driver.interface';

const ALLOWED_MIMES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_BYTES = 8 * 1024 * 1024;

interface ResizeOptions {
  maxWidth: number;
  quality?: number;
}

@Injectable()
export class UploadsService {
  constructor(@Inject(STORAGE_DRIVER) private readonly storage: StorageDriver) {}

  async saveNewsImage(file: Express.Multer.File, options: ResizeOptions): Promise<StoredFile> {
    this.assertImageFile(file);

    const processed = await sharp(file.buffer)
      .rotate()
      .resize({ width: options.maxWidth, withoutEnlargement: true })
      .webp({ quality: options.quality ?? 82 })
      .toBuffer();

    const now = new Date();
    const yyyy = now.getUTCFullYear();
    const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
    const filename = `${randomUUID()}.webp`;
    const relativePath = `news/${yyyy}/${mm}/${filename}`;

    return this.storage.save(processed, relativePath, 'image/webp');
  }

  private assertImageFile(file: Express.Multer.File | undefined): void {
    if (!file) {
      throw new BadRequestException('Keine Datei empfangen');
    }
    if (file.size > MAX_BYTES) {
      throw new BadRequestException('Datei zu groß (max 8 MB)');
    }
    if (!ALLOWED_MIMES.has(file.mimetype)) {
      throw new BadRequestException('Nur JPEG, PNG oder WebP erlaubt');
    }
  }
}
