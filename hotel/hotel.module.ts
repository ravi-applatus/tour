import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HotelRoomModule } from '../hotel-room/hotel-room.module';
import { TourismModule } from '../tourism/tourism.module';
import { HotelFeatureEntity } from './entities/hotel-feature.entity';
import { HotelImageEntity } from './entities/hotel-image.entity';
import { HotelMapFeatureEntity } from './entities/hotel-map-feature.entity';
import { HotelVideoEntity } from './entities/hotel-video.entity';
import { HotelEntity } from './entities/hotel.entity';
import { HotelController } from './hotel.controller';
import { HotelService } from './hotel.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      HotelEntity,
      HotelFeatureEntity,
      HotelMapFeatureEntity,
      HotelImageEntity,
      HotelVideoEntity,
    ]),
    TourismModule,
    HotelRoomModule,
  ],
  controllers: [HotelController],
  providers: [HotelService],
  exports: [HotelService],
})
export class HotelModule {}
