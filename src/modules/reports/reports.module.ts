import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { Customer } from '@/modules/customer/entities/customer.entity';
import { Rental } from '@/modules/rental/entities/rental.entity';
import { Payment } from '@/modules/payment/entities/payment.entity';
import { Room } from '@/modules/room/entities/room.entity';
import { Maintenance } from '@/modules/maintenance/entities/maintenance.entity';

@Module({
  imports: [
    SequelizeModule.forFeature([Customer, Rental, Payment, Room, Maintenance]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
