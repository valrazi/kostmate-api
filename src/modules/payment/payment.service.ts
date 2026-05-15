import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Payment } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { WhatsappQueueService } from '@/modules/whatsapp-queue/whatsapp-queue.service';
import { InvoiceService } from '@/modules/whatsapp-queue/invoice.service';
import dayjs from 'dayjs';

@Injectable()
export class PaymentService {
  constructor(
    @InjectModel(Payment)
    private readonly paymentModel: typeof Payment,
    private readonly whatsappQueueService: WhatsappQueueService,
    private readonly invoiceService: InvoiceService,
  ) { }

  async create(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    return this.paymentModel.create(createPaymentDto as any);
  }

  async findAll(branchId: string | undefined): Promise<Payment[]> {
    if (branchId) {
      return this.paymentModel.findAll({
        include: ['rental', 'room', 'customer', 'branch'],
        where: {
          branchId,
        },
        order: [['createdAt', 'DESC']],
      });
    }
    console.log({ branchId })
    return [];
  }

  async findOne(id: string): Promise<Payment> {
    const payment = await this.paymentModel.findByPk(id, {
      include: ['rental', 'room', 'customer', { association: 'branch', include: ['owner'] }],
    });
    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }
    return payment;
  }

  async update(id: string, updatePaymentDto: UpdatePaymentDto): Promise<Payment> {
    const payment = await this.findOne(id);

    const isChangingToPaid = updatePaymentDto.status === 'paid' && payment.status !== 'paid';

    await payment.update(updatePaymentDto);

    if (isChangingToPaid && payment.customer && payment.branch) {
      const invoicePath = await this.invoiceService.generateInvoice(
        payment.id,
        payment.customer.name,
        payment.amount,
        'Lunas',
        new Date(payment.dueDate),
        new Date(),
        payment.room?.roomNumber,
        payment.paymentMethod,
        `${payment.branch?.name} - ${payment.branch?.owner?.phoneNumber || ''}`,
        dayjs(payment.dueDate).format('MMMM YYYY')
      );

      const messageText = `Halo ${payment.customer.name}, pembayaranmu sebesar Rp ${payment.amount.toLocaleString('id-ID')} untuk tagihan kost sudah berhasil diverifikasi (Lunas). Terima kasih!`;
      await this.whatsappQueueService.enqueue(
        payment.branch.ownerId,
        payment.branchId,
        payment.customerId,
        payment.customer.whatsappNumber,
        messageText,
        invoicePath
      );
    }

    return payment;
  }

  async remove(id: string): Promise<void> {
    const payment = await this.findOne(id);
    await payment.destroy();
  }
}
