import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailModule } from '../../mail/mail.module';
import { NotificationModule } from '../notification/notification.module';
import { SignupRequestEntity } from './entities/signup-request.entity';
import { SignupRequestController } from './signup-request.controller';
import { SignupRequestService } from './signup-request.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([SignupRequestEntity]),
    MailModule,
    NotificationModule,
  ],
  controllers: [SignupRequestController],
  providers: [SignupRequestService],
  exports: [SignupRequestService],
})
export class SignupRequestModule {}
