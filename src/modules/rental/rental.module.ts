// src/modules/rental/rental.module.ts
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Rental } from './entities/rental.entity';
import { RentalService } from './rental.service';
import { RentalController } from './rental.controller';
import { RoomModule } from '@/modules/room/room.module';
import { CustomerModule } from '@/modules/customer/customer.module';
import { BranchModule } from '@/modules/branch/branch.module';

@Module({
  imports: [
    SequelizeModule.forFeature([Rental]),
    RoomModule,     
    CustomerModule, 
    BranchModule
  ],
  providers: [RentalService],
  controllers: [RentalController],
  exports: [RentalService],
})
export class RentalModule {}