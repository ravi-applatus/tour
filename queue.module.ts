import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { QueueProcessor } from './queue.processor';
import { InvoiceModule } from 'src/modules/invoice/invoice.module';

@Module({
  imports: [BullModule.registerQueue({ name: 'queue' }), InvoiceModule],
  providers: [QueueProcessor],
})
export class QueueModule {}
