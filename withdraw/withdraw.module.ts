import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationModule } from '../notification/notification.module';
import { TourismModule } from '../tourism/tourism.module';
import { UserModule } from '../user/user.module';
import { WithdrawEntity } from './entities/withdraw.entity';
import { WithdrawController } from './withdraw.controller';
import { WithdrawService } from './withdraw.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([WithdrawEntity]),
    UserModule,
    NotificationModule,
    TourismModule,
  ],
  controllers: [WithdrawController],
  providers: [WithdrawService],
  exports: [WithdrawService],
})
export class WithdrawModule {}
