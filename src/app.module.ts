import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import databaseConfig from './config/database.config';
import redisConfig from './config/redis.config';
import jwtConfig from './config/jwt.config';
import { User } from './modules/users/entities/user.entity';
import { Owner } from './modules/owner/entities/owner.entity';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RedisModule } from './redis/redis.module';
import { ThrottlerGuard } from '@nestjs/throttler';
import { RequestLoggingMiddleware } from './redis/middlewares/request-logging.middleware';
import { OwnerModule } from './modules/owner/owner.module';
import { BranchModule } from '@/modules/branch/branch.module';
import { RoomModule } from '@/modules/room/room.module';
import { CustomerModule } from '@/modules/customer/customer.module';
import { RentalModule } from '@/modules/rental/rental.module';
import { MediaModule } from '@/modules/media/media.module';
import { PaymentModule } from '@/modules/payment/payment.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, redisConfig, jwtConfig],
      envFilePath: ['.env.' + (process.env.NODE_ENV ?? 'development'), '.env'],
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        throttlers: [
          {
            ttl: configService.get<number>('THROTTLE_TTL', 60),
            limit: configService.get<number>('THROTTLE_LIMIT', 20),
          },
        ],
      }),
    }),
    SequelizeModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        dialect: 'mysql',
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.database'),
        autoLoadModels: true,
        synchronize: false,
        logging: configService.get<boolean>('database.logging') ? console.log : false,
      }),
    }),
    RedisModule,
    AuthModule,
    UsersModule,
    OwnerModule,
    BranchModule,
    RoomModule,
    CustomerModule,
    RentalModule,
    MediaModule,
    PaymentModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestLoggingMiddleware).forRoutes('*');
  }
}
