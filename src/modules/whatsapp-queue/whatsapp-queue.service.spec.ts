import { Test, TestingModule } from '@nestjs/testing';
import { WhatsappQueueService } from './whatsapp-queue.service';

describe('WhatsappQueueService', () => {
  let service: WhatsappQueueService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WhatsappQueueService],
    }).compile();

    service = module.get<WhatsappQueueService>(WhatsappQueueService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
