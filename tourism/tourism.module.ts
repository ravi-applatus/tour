import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { TourismLevelEntity } from './entities/tourism-level.entity';
import { TourismEntity } from './entities/tourism.entity';
import { TourismController } from './tourism.controller';
import { TourismService } from './tourism.service';
@Module({
  imports: [
    TypeOrmModule.forFeature([TourismEntity, TourismLevelEntity]),
    forwardRef(() => UserModule),
  ],
  controllers: [TourismController],
  providers: [TourismService],
  exports: [TourismService],
})
export class TourismModule {}
