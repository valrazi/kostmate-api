// src/modules/room/room.module.ts
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Room } from './entities/room.entity';
import { RoomService } from './room.service';
import { RoomController } from './room.controller';
import { BranchModule } from '@/modules/branch/branch.module';

@Module({
  imports: [
    SequelizeModule.forFeature([Room]),
    BranchModule, // Butuh ini untuk validasi branchId saat create room
  ],
  providers: [RoomService],
  controllers: [RoomController],
  exports: [RoomService],
})
export class RoomModule {}