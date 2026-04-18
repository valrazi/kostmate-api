import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UsersController } from './controllers/users.controller';
import { UsersService } from './services/users.service';
import { User } from './entities/user.entity';
import { forwardRef } from '@nestjs/common';
import { OwnerModule } from '@/modules/owner/owner.module';

@Module({
  imports: [SequelizeModule.forFeature([User]), forwardRef(() => OwnerModule)],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
