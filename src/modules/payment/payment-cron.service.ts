import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/sequelize';
import { Rental } from '@/modules/rental/entities/rental.entity';
import { Payment } from './entities/payment.entity';
import { Op } from 'sequelize';
import { Customer } from '@/modules/customer/entities/customer.entity';
import { Branch } from '@/modules/branch/entities/branch.entity';
import { WhatsappQueueService } from '@/modules/whatsapp-queue/whatsapp-queue.service';
import { InvoiceService } from '@/modules/whatsapp-queue/invoice.service';
import dayjs from 'dayjs';

@Injectable()
export class PaymentCronService {
  private readonly logger = new Logger(PaymentCronService.name);

  constructor(
    @InjectModel(Rental)
    private readonly rentalModel: typeof Rental,
    @InjectModel(Payment)
    private readonly paymentModel: typeof Payment,
    private readonly whatsappQueueService: WhatsappQueueService,
    private readonly invoiceService: InvoiceService,
  ) { }

  @Cron(CronExpression.EVERY_10_SECONDS)
  async handleDailyPaymentGeneration() {
    this.logger.debug('Running daily payment generation cron job...');

    try {
      const today = new Date();

      // We will look for rentals that are active
      const activeRentals = await this.rentalModel.findAll({
        where: {
          status: 'active',
        },
        include: [Customer, Branch],
      });

      let generatedCount = 0;

      for (const rental of activeRentals) {
        const nextDueDate = new Date(rental.dueDateDay);

        // Strip time from today for accurate date comparison
        const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const dueDateOnly = new Date(nextDueDate.getFullYear(), nextDueDate.getMonth(), nextDueDate.getDate());

        if (todayDateOnly >= dueDateOnly) {
          // Check if a payment for this exact due date already exists
          const existingPayment = await this.paymentModel.findOne({
            where: {
              rentalId: rental.id,
              dueDate: nextDueDate,
            },
          });

          if (!existingPayment) {
            // Generate new payment for this due date
            const newPayment = await this.paymentModel.create({
              rentalId: rental.id,
              roomId: rental.roomId,
              customerId: rental.customerId,
              branchId: rental.branchId,
              amount: rental.monthlyPrice,
              status: 'pending',
              dueDate: nextDueDate,
            } as any);

            const payment = await this.paymentModel.findByPk(newPayment.id, {
              include: ['rental', 'room', 'customer', { association: 'branch', include: ['owner'] }],
            });

            // Generate Invoice PDF
            const invoicePath = await this.invoiceService.generateInvoice(
              newPayment.id,
              rental.customer.name,
              rental.monthlyPrice,
              'Tagihan',
              new Date(newPayment.dueDate),
              undefined,
              payment?.room?.roomNumber,
              payment?.paymentMethod,
              `${payment?.branch?.name} - ${payment?.branch?.owner?.phoneNumber || ''}`,
              dayjs(payment?.dueDate).format('MMMM YYYY')
            );

            // Dispatch Whatsapp Message
            const messageText = `Halo ${rental.customer.name}, tagihan kamar kostmu sebesar Rp ${rental.monthlyPrice.toLocaleString('id-ID')} sudah keluar dan jatuh tempo pada ${nextDueDate.toLocaleDateString('id-ID')}. Mohon segera lakukan pembayaran.`;
            await this.whatsappQueueService.enqueue(
              rental.branch.ownerId,
              rental.branchId,
              rental.customerId,
              rental.customer.whatsappNumber,
              messageText,
              invoicePath
            );

            // Advance the cycle to the next period
            const nextDue = new Date(nextDueDate);
            const nextNotif = new Date(rental.notificationDay);

            if (rental.rentType === 'monthly') {
              nextDue.setMonth(nextDue.getMonth() + 1);
              nextNotif.setMonth(nextNotif.getMonth() + 1);
            } else if (rental.rentType === 'weekly') {
              nextDue.setDate(nextDue.getDate() + 7);
              nextNotif.setDate(nextNotif.getDate() + 7);
            } else if (rental.rentType === 'daily') {
              nextDue.setDate(nextDue.getDate() + 1);
              nextNotif.setDate(nextNotif.getDate() + 1);
            } else {
              // Default fallback
              nextDue.setMonth(nextDue.getMonth() + 1);
              nextNotif.setMonth(nextNotif.getMonth() + 1);
            }

            // Update rental with new dates
            await rental.update({
              dueDateDay: nextDue,
              notificationDay: nextNotif,
            });

            generatedCount++;
          }
        }
      }

      this.logger.debug(`Cron Job completed. Generated ${generatedCount} payments.`);
    } catch (error) {
      this.logger.error('Error during daily payment generation cron job', error);
    }
  }
}
