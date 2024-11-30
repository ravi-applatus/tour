import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HotelRoomEntity } from '../hotel-room/entities/hotel-room.entity';
import { TourismModule } from '../tourism/tourism.module';
import { HotelRoomAvailabilityEntity } from './entities/hotel-room-availability.entity';
import { HotelRoomPriceEntity } from './entities/hotel-room-price.entity';
import { HotelRoomController } from './hotel-room.controller';
import { HotelRoomService } from './hotel-room.service';
import { HotelRoomChildPriceEntity } from './entities/hotel-room-child-price.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      HotelRoomEntity,
      HotelRoomPriceEntity,
      HotelRoomAvailabilityEntity,
      HotelRoomChildPriceEntity,
    ]),
    TourismModule,
  ],
  controllers: [HotelRoomController],
  providers: [HotelRoomService],
  exports: [HotelRoomService],
})
export class HotelRoomModule {}
