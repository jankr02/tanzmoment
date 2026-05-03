import { ApiProperty } from '@nestjs/swagger';
import { NewsletterSubscriberStatus } from '@prisma/client';

export class SubscriberStatusDto {
  @ApiProperty({ enum: NewsletterSubscriberStatus })
  status!: NewsletterSubscriberStatus;
}
