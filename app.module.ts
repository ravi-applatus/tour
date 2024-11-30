import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigurationModule } from './config/configuration.module';
import { TypeOrmConfigService } from './database/typeorm-config.service';
import { ErrorModule } from './error/error.module';
import { MailConfigService } from './mail/mail-config.service';
import { AuthModule } from './modules/auth/auth.module';
import { CommonModule } from './modules/common/common.module';
import { CurrencyModule } from './modules/currency/currency.module';
import { CustomerModule } from './modules/customer/customer.module';
import { HotelOfferModule } from './modules/hotel-offer/hotel-offer.module';
import { HotelRoomModule } from './modules/hotel-room/hotel-room.module';
import { HotelModule } from './modules/hotel/hotel.module';
import { InvoiceModule } from './modules/invoice/invoice.module';
import { NotificationModule } from './modules/notification/notification.module';
import { OrderHotelModule } from './modules/order-hotel/order-hotel.module';
import { OrderTourModule } from './modules/order-tour/order-tour.module';
import { PaymentModule } from './modules/payment/payment.module';
import { RoleModule } from './modules/role/role.module';
import { SettingModule } from './modules/setting/setting.module';
import { SignupRequestModule } from './modules/signup-request/signup-request.module';
import { SliderModule } from './modules/slider/slider.module';
import { TourModule } from './modules/tour/tour.module';
import { TourismModule } from './modules/tourism/tourism.module';
import { UserModule } from './modules/user/user.module';
import { WithdrawModule } from './modules/withdraw/withdraw.module';
// import { BullConfigService } from './queue/queue-config.service';
// import { QueueModule } from './queue/queue.module';
// import { TasksModule } from './tasks/tasks.module';
import { ErrorsInterceptor } from './utils/interceptors/errors.interceptor';
import { TransferModule } from './modules/transfer/transfer.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
    }),
    ConfigurationModule.register(),
    MailerModule.forRootAsync({
      useClass: MailConfigService,
    }),
    // BullModule.forRootAsync({
    //   useClass: BullConfigService,
    // }),
    ErrorModule.register(),
    ScheduleModule.forRoot(),

    // Project modules
    // QueueModule,
    // TasksModule,
    CommonModule,
    SettingModule,
    AuthModule,
    RoleModule,
    UserModule,
    HotelModule,
    HotelRoomModule,
    CurrencyModule,
    CustomerModule,
    TourismModule,
    WithdrawModule,
    OrderHotelModule,
    InvoiceModule,
    HotelOfferModule,
    PaymentModule,
    TourModule,
    OrderTourModule,
    SliderModule,
    SignupRequestModule,
    NotificationModule,
    TransferModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ErrorsInterceptor,
    },
  ],
})
export class AppModule {}
