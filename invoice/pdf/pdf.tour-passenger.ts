import * as path from 'path';
import { v4 as uuid } from 'uuid';
import { PDF } from 'src/utils/pdf';
import { OrderTourEntity } from '../../order-tour/entities/order-tour.entity';
import { seperateChildAndAdultList } from '../../../utils';

import * as moment from 'jalali-moment';

export const generateTourPassengerPDF = (
  orderTour: OrderTourEntity,
  hotelName: string,
  tourismNumber,
) => {
  const ticketBackground = path.join(
    __dirname,
    '../../..',
    'assets/images/ticket-tour-passenger.png',
  );

  // Create a document
  const filePath = `/tour_ticket/tour_ticket_passenger_${uuid()}.pdf`;
  const pdf = new PDF(path.join(__dirname, '../../../..', 'uploads', filePath));

  const tour = orderTour.tour;
  const invoiceCustomers = orderTour.invoiceCustomers;

  const { childs, adults, infants } =
    seperateChildAndAdultList(invoiceCustomers);

  pdf.addImage(ticketBackground, 0, 0, 600);

  pdf.addText(`${tourismNumber || ''}`, 50, 30, 55, {
    size: 11,
  });

  pdf.addText(`${tour.name.toUpperCase()} TOUR TICKET`, 50, 50, 270, {
    size: 11,
  });

  ///////////////////////////////////

  pdf.addText(
    invoiceCustomers
      .map((customer) => `${customer.firstName} ${customer.lastName}`)
      .join(' - '),
    40,
    106,
    120,
    {
      size: 8,
      lineGap: 10,
    },
  );

  pdf.addText(hotelName, 180, 106, 95);

  pdf.addText(`${adults.length + childs.length}`, 300, 90, 36);

  pdf.addText(`${childs.length}`, 344, 90, 34);

  pdf.addText(`${infants.length}`, 378, 90, 34);

  pdf.addText(`${orderTour.price} $`, 261, 130, 58);

  pdf.addText(`${orderTour.amount} $`, 356, 130, 88);

  pdf.addText(moment(orderTour.createdAt).format('YYYY/MM/DD'), 291, 166, 134);

  pdf.addText(`${tour.name.toUpperCase()} TOUR TICKET`, 432, 77, 100, {
    size: 7,
  });

  pdf.addText(
    invoiceCustomers
      .map((customer) => `${customer.firstName} ${customer.lastName}`)
      .join(' - '),
    432,
    110,
    110,
    {
      size: 6,
      lineGap: 5,
    },
  );

  pdf.addText(`${adults.length + childs.length}`, 455, 139, 36);

  pdf.addText(`${childs.length}`, 494, 139, 34);

  pdf.addText(`${infants.length}`, 532, 139, 34);

  pdf.addText(`${orderTour.price}`, 455, 161, 42, {
    size: 7,
  });

  pdf.addText(`${orderTour.amount} $`, 523, 161, 88, {
    size: 7,
  });

  pdf.addText(hotelName, 459, 182, 99, {
    size: 7,
  });

  // Finalize PDF file
  pdf.end();

  return filePath;
};
