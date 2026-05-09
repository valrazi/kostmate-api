import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Branch } from '@/modules/branch/entities/branch.entity';
import { Room } from '@/modules/room/entities/room.entity';
import { Customer } from '@/modules/customer/entities/customer.entity';
import { Rental } from '@/modules/rental/entities/rental.entity';
import { Payment } from '@/modules/payment/entities/payment.entity';

@Module({
  imports: [
    SequelizeModule.forFeature([Branch, Room, Customer, Rental, Payment]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
