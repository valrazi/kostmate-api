import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { Payment } from './entities/payment.entity';
import { PaymentCronService } from './payment-cron.service';
import { Rental } from '@/modules/rental/entities/rental.entity';
import { AuthModule } from '@/modules/auth/auth.module';

@Module({
  imports: [
    SequelizeModule.forFeature([Payment, Rental]),
    AuthModule,
  ],
  controllers: [PaymentController],
  providers: [PaymentService, PaymentCronService],
  exports: [PaymentService],
})
export class PaymentModule {}
