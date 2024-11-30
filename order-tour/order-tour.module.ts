import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SettingModule } from 'src/modules/setting/setting.module';
import { TourModule } from 'src/modules/tour/tour.module';
import { InvoiceModule } from '../invoice/invoice.module';
import { TourismModule } from '../tourism/tourism.module';
import { OrderTourMapFeatureEntity } from './entities/order-tour-map-feature.entity';
import { OrderTourEntity } from './entities/order-tour.entity';
import { OrderTourController } from './order-tour.controller';
import { OrderTourService } from './order-tour.service';
import { CustomerModule } from '../customer/customer.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrderTourEntity, OrderTourMapFeatureEntity]),
    TourModule,
    TourismModule,
    TourModule,
    SettingModule,
    CustomerModule,
    forwardRef(() => InvoiceModule),
  ],
  controllers: [OrderTourController],
  providers: [OrderTourService],
  exports: [OrderTourService],
})
export class OrderTourModule {}
