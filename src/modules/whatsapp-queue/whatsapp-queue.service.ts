import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { WhatsappQueue } from './entities/whatsapp-queue.entity';
import { RedisService } from '@/redis/redis.service';

@Injectable()
export class WhatsappQueueService {
    constructor(
        @InjectModel(WhatsappQueue)
        private readonly whatsappQueueModel: typeof WhatsappQueue,
        private readonly redisService: RedisService,
    ) { }

    async enqueue(ownerId: string, branchId: string, customerId: string, customerWhatsappNumber: string, messageText: string, filePath?: string) {
        const queueRecord = await this.whatsappQueueModel.create({
            ownerId,
            branchId,
            customerId,
            customerWhatsappNumber,
            messageText,
            filePath,
        } as any);

        // Dispatch / publish event to Redis
        await this.redisService.publish('whatsapp-queue-events', JSON.stringify({ id: queueRecord.id }));

        return queueRecord;
    }

    async findAll(branchId: string) {
        return this.whatsappQueueModel.findAll({
            where: { branchId },
            include: ['customer'],
            order: [['createdAt', 'DESC']],
        });
    }
}
