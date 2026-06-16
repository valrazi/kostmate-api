import { Module, forwardRef } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Owner } from './entities/owner.entity';
import { UsersModule } from '@/modules/users/users.module';
import { OwnerService } from './owner.service';
import { OwnerController } from './owner.controller';

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