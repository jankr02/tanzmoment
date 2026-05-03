import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { AuthModule } from '../auth/auth.module';
import { LocalDiskDriver } from './storage/local-disk.driver';
import { STORAGE_DRIVER } from './storage/storage-driver.interface';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';

@Module({
  imports: [
    AuthModule,
    MulterModule.register({
      storage: memoryStorage(),
      limits: { fileSize: 8 * 1024 * 1024 },
    }),
  ],
  controllers: [UploadsController],
  providers: [
    UploadsService,
    { provide: STORAGE_DRIVER, useClass: LocalDiskDriver },
  ],
  exports: [UploadsService, STORAGE_DRIVER],
})
export class UploadsModule {}
