import { Module, forwardRef } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Owner } from './entities/owner.entity';
import { OwnerService } from './owner.service';
import { OwnerController } from './owner.controller';
import { UsersModule } from '@/modules/users/users.module';

@Module({
  imports: [
    SequelizeModule.forFeature([Owner]),
    forwardRef(() => UsersModule),
  ],
  providers: [OwnerService],
  controllers: [OwnerController],
  exports: [OwnerService],
})
export class OwnerModule {}