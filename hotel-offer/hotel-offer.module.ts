import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HotelRoomModule } from '../hotel-room/hotel-room.module';
import { TourismModule } from '../tourism/tourism.module';
import { HotelLevelOfferEntity } from './entities/hotel-level-offer.entity';
import { HotelOfferController } from './hotel-offer.controller';
import { HotelOfferService } from './hotel-offer.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([HotelLevelOfferEntity]),
    TourismModule,
    HotelRoomModule,
  ],
  controllers: [HotelOfferController],
  providers: [HotelOfferService],
  exports: [HotelOfferService],
})
export class HotelOfferModule {}
