import { Injectable, Logger } from '@nestjs/common';
import { promises as fs } from 'fs';
import { dirname, join } from 'path';
import sharp from 'sharp';
import { StorageDriver, StoredFile } from './storage-driver.interface';

const UPLOADS_ROOT = join(process.cwd(), 'apps/api/uploads');
const PUBLIC_PREFIX = '/uploads';

@Injectable()
export class LocalDiskDriver implements StorageDriver {
  private readonly logger = new Logger(LocalDiskDriver.name);

  async save(buffer: Buffer, relativePath: string, mimeType: string): Promise<StoredFile> {
    const absolutePath = join(UPLOADS_ROOT, relativePath);
    await fs.mkdir(dirname(absolutePath), { recursive: true });
    await fs.writeFile(absolutePath, buffer);

    const metadata = await sharp(buffer).metadata();

    this.logger.log(`Saved upload to ${relativePath} (${buffer.length} bytes)`);

    return {
      url: `${PUBLIC_PREFIX}/${relativePath}`,
      relativePath,
      width: metadata.width ?? 0,
      height: metadata.height ?? 0,
      bytes: buffer.length,
      format: metadata.format ?? mimeType.replace('image/', ''),
    };
  }

  async delete(relativePath: string): Promise<void> {
    const absolutePath = join(UPLOADS_ROOT, relativePath);
    try {
      await fs.unlink(absolutePath);
    } catch (err) {
      const error = err as NodeJS.ErrnoException;
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
  }
}

export { UPLOADS_ROOT, PUBLIC_PREFIX };
