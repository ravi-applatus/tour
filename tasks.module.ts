import { Module } from '@nestjs/common';
import { InvoiceModule } from 'src/modules/invoice/invoice.module';
import { TasksService } from './tasks.service';

@Module({
  imports: [InvoiceModule],
  providers: [TasksService],
})
export class TasksModule {}
