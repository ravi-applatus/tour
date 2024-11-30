import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RagaexModule } from 'src/gateway/ragaex/ragaex.module';
import { SettingModule } from '../setting/setting.module';
import { CurrencyController } from './currency.controller';
import { CurrencyService } from './currency.service';
import { CurrencyEntity } from './entities/currency.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CurrencyEntity]),
    RagaexModule,
    SettingModule,
  ],
  controllers: [CurrencyController],
  providers: [CurrencyService],
  exports: [CurrencyService],
})
export class CurrencyModule {}
