import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailModule } from '../../mail/mail.module';
import { CustomerModule } from '../customer/customer.module';
import { HotelOfferModule } from '../hotel-offer/hotel-offer.module';
import { HotelRoomModule } from '../hotel-room/hotel-room.module';
import { HotelModule } from '../hotel/hotel.module';
import { InvoiceModule } from '../invoice/invoice.module';
import { NotificationModule } from '../notification/notification.module';
import { SettingModule } from '../setting/setting.module';
import { TourismModule } from '../tourism/tourism.module';
import { OrderHotelMapFeatureEntity } from './entities/order-hotel-map-feature.entity';
import { OrderHotelMapRoomEntity } from './entities/order-hotel-map-room.entity';
import { OrderHotelEntity } from './entities/order-hotel.entity';
import { OrderHotelController } from './order-hotel.controller';
import { OrderHotelService } from './order-hotel.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OrderHotelEntity,
      OrderHotelMapRoomEntity,
      OrderHotelMapFeatureEntity,
    ]),
    HotelRoomModule,
    TourismModule,
    HotelModule,
    SettingModule,
    CustomerModule,
    HotelOfferModule,
    MailModule,
    NotificationModule,
    forwardRef(() => InvoiceModule),
  ],
  controllers: [OrderHotelController],
  providers: [OrderHotelService],
  exports: [OrderHotelService],
})
export class OrderHotelModule {}
