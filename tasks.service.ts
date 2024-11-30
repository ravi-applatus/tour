import { Injectable } from '@nestjs/common';
// import { Cron } from '@nestjs/schedule';
import { InvoiceService } from 'src/modules/invoice/invoice.service';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class TasksService {
  constructor(private invoiceService: InvoiceService) {}

  // @Cron(process.env.CRON_JOB_REJECT_UNPAID_INVOICE)
  // async handleRejectUnpaid() {
  //   console.log('CRON JOB FOR REJECT UNPAID INVOICE');
  //   await this.invoiceService.rejectUnpaidInvoices();
  // }
}
