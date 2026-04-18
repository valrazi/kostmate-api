// src/modules/branch/branch.module.ts
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Branch } from './entities/branch.entity';
import { BranchService } from './branch.service';
import { BranchController } from './branch.controller';

@Module({
  imports: [SequelizeModule.forFeature([Branch])],
  providers: [BranchService],
  controllers: [BranchController],
  exports: [BranchService], 
})
export class BranchModule {}