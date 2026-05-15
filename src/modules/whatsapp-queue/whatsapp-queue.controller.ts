import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { WhatsappQueueService } from './whatsapp-queue.service';

@ApiTags('Whatsapp Queue')
@Controller('whatsapp-queue')
export class WhatsappQueueController {
  constructor(private readonly whatsappQueueService: WhatsappQueueService) {}

  @Get()
  @ApiOperation({ summary: 'Get all whatsapp queues by branch' })
  @ApiQuery({ name: 'branch_id', required: true })
  findAll(@Query('branch_id') branchId: string) {
    if (!branchId) {
      throw new BadRequestException('branch_id is required');
    }
    return this.whatsappQueueService.findAll(branchId);
  }
}
