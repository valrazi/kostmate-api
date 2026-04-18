// src/modules/customer/customer.module.ts
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Customer } from './entities/customer.entity';
import { CustomerService } from './customer.service';
import { CustomerController } from './customer.controller';
import { BranchModule } from '@/modules/branch/branch.module';

@Module({
  imports: [
    SequelizeModule.forFeature([Customer]),
    BranchModule,
  ],
  providers: [CustomerService],
  controllers: [CustomerController],
  exports: [CustomerService],
})
export class CustomerModule {}