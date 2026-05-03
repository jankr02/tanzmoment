import { Module } from '@nestjs/common';
import { NewsController } from './news.controller';
import { NewsService } from './news.service';
import { TiptapRendererService } from './tiptap-renderer.service';

@Module({
  controllers: [NewsController],
  providers: [NewsService, TiptapRendererService],
  exports: [TiptapRendererService],
})
export class NewsModule {}
