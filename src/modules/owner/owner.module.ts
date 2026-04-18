import { Module, forwardRef } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Owner } from './entities/owner.entity';
import { UsersModule } from '@/modules/users/users.module';

@Module({
  imports: [
    SequelizeModule.forFeature([Owner]),
    forwardRef(() => UsersModule),
  ],
  providers: [],
  controllers: [],
  exports: [],
})
export class OwnerModule {}