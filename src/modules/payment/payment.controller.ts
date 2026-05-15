import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentCronService } from './payment-cron.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';

@ApiTags('payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly paymentCronService: PaymentCronService
  ) { }

  @Post('/trigger-cron')
  @ApiOperation({ summary: 'Manually trigger daily payment generation' })
  async triggerCron() {
    await this.paymentCronService.handleDailyPaymentGeneration();
    return { message: 'Cron job executed manually.' };
  }

  @Post()
  @ApiOperation({ summary: 'Create a new payment' })
  create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentService.create(createPaymentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all payments' })
  @ApiQuery({ name: 'branch_id', required: true })
  findAll(@Query('branch_id') branchId?: string) {
    return this.paymentService.findAll(branchId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a payment by id' })
  findOne(@Param('id') id: string) {
    return this.paymentService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a payment' })
  update(@Param('id') id: string, @Body() updatePaymentDto: UpdatePaymentDto) {
    return this.paymentService.update(id, updatePaymentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a payment' })
  remove(@Param('id') id: string) {
    return this.paymentService.remove(id);
  }
}
