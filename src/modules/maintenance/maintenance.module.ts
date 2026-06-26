import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Maintenance } from './entities/maintenance.entity';
import { MaintenanceService } from './maintenance.service';
import { MaintenanceController } from './maintenance.controller';

@Module({
  imports: [SequelizeModule.forFeature([Maintenance])],
  providers: [MaintenanceService],
  controllers: [MaintenanceController],
  exports: [MaintenanceService],
})
export class MaintenanceModule {}
