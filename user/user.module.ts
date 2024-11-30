import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailModule } from 'src/mail/mail.module';
import { TourismModule } from '../tourism/tourism.module';
import { UserWalletHistoryEntity } from './entities/user-wallet-history.entity';
import { UserEntity } from './entities/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';
@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, UserWalletHistoryEntity]),
    MailModule,
    forwardRef(() => TourismModule),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
