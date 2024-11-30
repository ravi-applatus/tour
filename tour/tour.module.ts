import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TourismModule } from '../tourism/tourism.module';
import { TourFeatureEntity } from './entities/tour-feature.entity';
import { TourImageEntity } from './entities/tour-image.entity';
import { TourMapFeatureEntity } from './entities/tour-map-feature.entity';
import { TourPriceEntity } from './entities/tour-price.entity';
import { TourEntity } from './entities/tour.entity';
import { TourController } from './tour.controller';
import { TourService } from './tour.service';
import { TourChildPriceEntity } from './entities/tour-child-price.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TourEntity,
      TourPriceEntity,
      TourImageEntity,
      TourMapFeatureEntity,
      TourFeatureEntity,
      TourChildPriceEntity,
    ]),
    TourismModule,
  ],
  controllers: [TourController],
  providers: [TourService],
  exports: [TourService],
})
export class TourModule {}
