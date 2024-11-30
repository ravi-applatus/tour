import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigurationService } from '../config/configuration.service';
import { MailData } from './interfaces/mail-data.interface';
import { v4 as uuid } from 'uuid';
import * as moment from 'jalali-moment';

@Injectable()
export class MailService {
  constructor(
    private mailerService: MailerService,
    private config: ConfigurationService,
  ) {}

  /**
   * How to send an Email
   *  to reset password
   *
   * await this.mailService.sendForgotPassword({
   *   to: 'dev@gmail.com',
   *   data: { hash: 'psh4-sdf4sa-034ddf-sadtp', firstName: 'Oliver', lastName: 'Willi' },
   * }),
   */
  async sendForgotPassword(
    mailData: MailData<{ hash: string; firstName: string; lastName: string }>,
  ) {
    const title = `فراموشی کلمه عبور در سایت ${this.config.app.name}`;
    const url = `${this.config.app.panelBaseUrl}/auth/reset-password?token=${mailData.data.hash}`;

    await this.mailerService.sendMail({
      to: mailData.to,
      subject: title,
      text: `${url} فراموشی کلمه عبور`,
      template: 'reset-password',
      context: {
        full_name:
          `${mailData.data.firstName} ${mailData.data.lastName}`.trim(),
        url,
        app_name: this.config.app.name,
        title,
      },
    });
  }

  /////////////////////////////////////////////////////////////////////////
  // async sendContact(
  //   mailData: MailData<{
  //     email: string;
  //     name: string;
  //     phone: string;
  //     subject: string;
  //     message: string;
  //   }>,
  // ) {
  //   const title = `${this.config.app.name} - ${mailData.data.subject}`;

  //   await this.mailerService.sendMail({
  //     to: mailData.to,
  //     from: mailData.data.email,
  //     subject: title,
  //     text: mailData.data.message,
  //     template: 'contact',
  //     context: {
  //       name: mailData.data.name,
  //       phone: mailData.data.phone,
  //       title: mailData.data.subject,
  //       message: mailData.data.message,
  //       app_name: this.config.app.name,
  //     },
  //   });
  // }

  /////////////////////////////////////////////////////////////////////////
  // async alertOrder(mailData: MailData<{ orderId: number }>) {
  //   const title = `سفارش جدید در سایت ${this.config.app.name}`;
  //   const url = `${this.config.app.panelBaseUrl}/dashboard/order/${mailData.data.orderId}`;

  //   await this.mailerService.sendMail({
  //     to: mailData.to,
  //     subject: title,
  //     text: `${url} سفارش جدید در سایت`,
  //     template: 'alert-order',
  //     context: {
  //       url,
  //       title,
  //       app_name: this.config.app.name,
  //     },
  //   });
  // }

  /////////////////////////////////////////////////////////////////////////
  async sendToHotel(
    mailData: MailData<{
      filePath: string;
      managerName: string;
      hotelName: string;
    }>,
  ) {
    const title = `Reserve ${mailData.data.hotelName}`;

    await this.mailerService.sendMail({
      to: mailData.to,
      subject: title,
      text: `Dear ${mailData.data.managerName} reserve ${mailData.data.hotelName} Done `,
      template: 'reserve-hotel',
      context: {
        title,
        managerName: mailData.data.managerName,
        app_name: this.config.app.name,
      },
      attachments: [
        {
          // file on disk as an attachment
          filename: `reserve_hotel_${moment().format('YYYY-MM-DD')}.pdf`,
          path: mailData.data.filePath, // stream this file
        },
      ],
    });
  }

  /////////////////////////////////////////////////////////////////////////////
  async sendToAgency(
    mailData: MailData<{
      tourismFilePath: string;
      passengerFilePaths: string[];
      managerName: string;
      agencyName: string;
      invoiceNumber: string;
    }>,
  ) {
    const title = `Invoice number ${mailData.data.invoiceNumber} was registered `;

    await this.mailerService.sendMail({
      to: mailData.to,
      subject: title,
      text: `Dear ${mailData.data.managerName} Invoice number ${mailData.data.invoiceNumber} was registered`,
      template: 'sale',
      context: {
        title,
        managerName: mailData.data.managerName,
        invoiceNumber: mailData.data.invoiceNumber,
        app_name: this.config.app.name,
      },
      attachments: [
        {
          // file on disk as an attachment
          filename: `sale_${moment().format('YYYY-MM-DD')}.pdf`,
          path: mailData.data.tourismFilePath, // stream this file
        },
        ...mailData.data.passengerFilePaths.map((passengerFilePath) => ({
          filename: `passenger_${moment().format('YYYY-MM-DD')}_${uuid()}.pdf`,
          path: passengerFilePath, // stream this file
        })),
      ],
    });
  }

  /////////////////////////////////////////////////////////////////////////////
  async sendToSelf(
    mailData: MailData<{
      filePath: string;
      invoiceNumber: string;
    }>,
  ) {
    const title = `Invoice number ${mailData.data.invoiceNumber} was registered `;

    await this.mailerService.sendMail({
      to: mailData.to,
      subject: title,
      text: `Invoice number ${mailData.data.invoiceNumber} was registered`,
      template: 'buy',
      context: {
        title,
        invoiceNumber: mailData.data.invoiceNumber,
        app_name: this.config.app.name,
      },
      attachments: [
        {
          // file on disk as an attachment
          filename: `buy_${moment().format('YYYY-MM-DD')}.pdf`,
          path: mailData.data.filePath, // stream this file
        },
      ],
    });
  }

  /////////////////////////////////////////////////////////////////////////////
  async notifyNewOrderToAdmin(
    mailData: MailData<{
      invoiceNumber: string;
    }>,
  ) {
    const title = `The new invoice #${mailData.data.invoiceNumber} has been submitted in the system`;

    await this.mailerService.sendMail({
      to: mailData.to,
      subject: title,
      text: title,
      template: 'new-order',
      context: {
        title,
        message: title,
        app_name: this.config.app.name,
      },
    });
  }

  /////////////////////////////////////////////////////////////////////////////
  async notifyNewSignupRequestToAdmin(mailData: MailData<any>) {
    const title = `The new request for signup has been submitted in the system`;

    await this.mailerService.sendMail({
      to: mailData.to,
      subject: title,
      text: title,
      template: 'new-signup-request',
      context: {
        title,
        message: title,
        app_name: this.config.app.name,
      },
    });
  }
}
