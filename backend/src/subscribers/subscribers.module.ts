import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subscriber } from './subscriber.entity';
import { SubscribersService } from './subscribers.service';
import { SubscribersController } from './subscribers.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Subscriber]), AuthModule],
  providers: [SubscribersService],
  controllers: [SubscribersController],
  exports: [SubscribersService],
})
export class SubscribersModule {}
