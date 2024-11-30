import { BullModule } from '@nestjs/bull';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailModule } from 'src/mail/mail.module';
import { CustomerModule } from '../customer/customer.module';
import { HotelRoomModule } from '../hotel-room/hotel-room.module';
import { NotificationModule } from '../notification/notification.module';
import { OrderHotelModule } from '../order-hotel/order-hotel.module';
import { OrderTourModule } from '../order-tour/order-tour.module';
import { SettingModule } from '../setting/setting.module';
import { TourismModule } from '../tourism/tourism.module';
import { UserModule } from '../user/user.module';
import { InvoiceCustomerEntity } from './entities/invoice-customer.entity';
import { InvoiceEntity } from './entities/invoice.entity';
import { InvoiceController } from './invoice.controller';
import { InvoiceService } from './invoice.service';
import { TransferModule } from '../transfer/transfer.module';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'queue' }),
    TypeOrmModule.forFeature([InvoiceEntity, InvoiceCustomerEntity]),
    CustomerModule,
    SettingModule,
    MailModule,
    UserModule,
    TourismModule,
    HotelRoomModule,
    NotificationModule,
    TransferModule,
    forwardRef(() => OrderHotelModule),
    forwardRef(() => OrderTourModule),
  ],
  controllers: [InvoiceController],
  providers: [InvoiceService],
  exports: [InvoiceService],
})
export class InvoiceModule {}
