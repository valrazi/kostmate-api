import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/sequelize';
import { Rental } from '@/modules/rental/entities/rental.entity';
import { Payment } from './entities/payment.entity';
import { Op } from 'sequelize';

@Injectable()
export class PaymentCronService {
  private readonly logger = new Logger(PaymentCronService.name);

  constructor(
    @InjectModel(Rental)
    private readonly rentalModel: typeof Rental,
    @InjectModel(Payment)
    private readonly paymentModel: typeof Payment,
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
      });

      let generatedCount = 0;

      for (const rental of activeRentals) {
        // Compare the day of the month with rental dueDateDay
        // Since dueDateDay is stored as DATEONLY, we can extract the date part or day
        // For simplicity, let's extract the day from dueDateDay if it is a specific date of the month
        // Or if dueDateDay means the exact date, we check if today's day matches dueDateDay's day
        const dueDay = new Date(rental.dueDateDay).getDate();
        const currentDay = today.getDate();

        if (dueDay === currentDay) {
          // Check if a payment for this rental for the current month and year already exists
          const currentMonth = today.getMonth();
          const currentYear = today.getFullYear();
          const startOfMonth = new Date(currentYear, currentMonth, 1);
          const endOfMonth = new Date(currentYear, currentMonth + 1, 0);

          const existingPayment = await this.paymentModel.findOne({
            where: {
              rentalId: rental.id,
              dueDate: {
                [Op.between]: [startOfMonth, endOfMonth],
              },
            },
          });

          if (!existingPayment) {
            // Generate new payment
            const dueDate = new Date(currentYear, currentMonth, dueDay);

            await this.paymentModel.create({
              rentalId: rental.id,
              roomId: rental.roomId,
              customerId: rental.customerId,
              branchId: rental.branchId,
              amount: rental.monthlyPrice,
              status: 'pending',
              dueDate: dueDate,
            } as any);

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
