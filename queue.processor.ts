import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { InvoiceService } from 'src/modules/invoice/invoice.service';

@Processor('queue')
export class QueueProcessor {
  constructor(private invoiceService: InvoiceService) {}

  @Process('info-passenger-deadline')
  async handleTranscode(job: Job) {
    console.log(job.data); // job.data.invoiceId

    await this.invoiceService.rejectedPassengersUpdateDeadline(
      job.data.invoiceId,
    );
  }

  //task 2 in this queue

  // @Process('info-passenger-deadline')
  // handleTranscode(job: Job) {
  //   console.log(job.data);
  // }
}
