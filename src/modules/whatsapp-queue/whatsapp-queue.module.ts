import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { WhatsappQueue } from './entities/whatsapp-queue.entity';
import { WhatsappQueueService } from './whatsapp-queue.service';
import { InvoiceService } from './invoice.service';
import { MediaModule } from '@/modules/media/media.module';
import { WhatsappQueueController } from './whatsapp-queue.controller';

@Module({
  imports: [
    SequelizeModule.forFeature([WhatsappQueue]),
    MediaModule,
  ],
  controllers: [WhatsappQueueController],
  providers: [WhatsappQueueService, InvoiceService],
  exports: [WhatsappQueueService, InvoiceService],
})
export class WhatsappQueueModule {}
