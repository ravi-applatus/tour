import { Module } from '@nestjs/common';
import { RagaexService } from './ragaex.service';

@Module({
  providers: [RagaexService],
  exports: [RagaexService],
})
export class RagaexModule {}
