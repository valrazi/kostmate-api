import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Payment } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

@Injectable()
export class PaymentService {
  constructor(
    @InjectModel(Payment)
    private readonly paymentModel: typeof Payment,
  ) {}

  async create(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    return this.paymentModel.create(createPaymentDto as any);
  }

  async findAll(): Promise<Payment[]> {
    return this.paymentModel.findAll({
      include: ['rental', 'room', 'customer', 'branch'],
      order: [['createdAt', 'DESC']],
    });
  }

  async findOne(id: string): Promise<Payment> {
    const payment = await this.paymentModel.findByPk(id, {
      include: ['rental', 'room', 'customer', 'branch'],
    });
    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }
    return payment;
  }

  async update(id: string, updatePaymentDto: UpdatePaymentDto): Promise<Payment> {
    const payment = await this.findOne(id);
    await payment.update(updatePaymentDto);
    return payment;
  }

  async remove(id: string): Promise<void> {
    const payment = await this.findOne(id);
    await payment.destroy();
  }
}
