import { InvoiceEntity } from '../entities/invoice.entity';
import * as moment from 'jalali-moment';
import * as path from 'path';
import { v4 as uuid } from 'uuid';
import { PDF } from 'src/utils/pdf';

export const generateBuyPDF = (invoice: InvoiceEntity) => {
  // Create a document
  const filePath = `/hotel_voucher/invoice_buy_hotel_${uuid()}.pdf`;
  const pdf = new PDF(path.join(__dirname, '../../../..', 'uploads', filePath));

  let pageNumber = 1;
  const hotel =
    invoice.orderHotels?.[0]?.orderHotelMapRooms?.[0]?.hotelRoom?.hotel;

  //////////////////////////////////////////////////////
  const transferAmount = invoice.transferBuyAmount;
  const tourAmount = invoice.orderTours.reduce(
    (sum, orderTour) => sum + orderTour.buyAmount,
    0,
  );
  //////////////////////////////////////////////////////

  invoice.orderHotels.forEach((orderHotel, orderIndex) => {
    orderHotel.orderHotelMapRooms.forEach((roomMap, mapIndex) => {
      const room = roomMap.hotelRoom;
      const invoiceCustomers = roomMap.invoiceCustomers;

      header(pdf, invoice, pageNumber++, hotel);

      pdf.addText(`HOTEL: ${hotel?.name || '-'}`, 30, 140, 200, {
        size: 10,
      });

      pdf.addText(
        `Tour Operator: ${invoice?.tourism?.name || '-'}`,
        30,
        160,
        200,
        {
          size: 10,
        },
      );

      pdf.addText(`Voucher: ${orderHotel.number || '-'}`, 30, 180, 200, {
        size: 10,
      });

      pdf.addText(
        `Inv.Nr: ${invoice.systemNumber || invoice.number}`,
        200,
        140,
        200,
        {
          size: 10,
        },
      );

      pdf.addText('Res.No: 1', 300, 140, 200, {
        size: 10,
      });

      const checkInMoment = moment(orderHotel.checkIn, 'YYYY-MM-DD');
      const checkOutMoment = moment(orderHotel.checkOut, 'YYYY-MM-DD');
      const nights = checkOutMoment.diff(checkInMoment, 'days');

      pdf.addText(
        `Accomodation: ${checkInMoment.format(
          'MM/DD/YYYY',
        )} ~ ${checkOutMoment.format('MM/DD/YYYY')}`,
        200,
        160,
        300,
        {
          size: 10,
        },
      );

      pdf.addText(`Nights: ${nights}`, 240, 180, 200, {
        size: 10,
      });

      pdf.addText(`Room: ${room.name || ''}`, 400, 140, 250, {
        size: 10,
      });

      pdf.addText(`Type: ${room.type || ''}`, 400, 160, 250, {
        size: 10,
      });

      pdf.addText('Brd: BB (BED AND BREAKFAST)', 400, 180, 250, {
        size: 10,
      });

      pdf.addText('Voucher Note:', 30, 225, 200, { size: 10 });

      pdf.addText('** Special Price **', 300, 300, 200, { size: 10 });

      invoiceCustomers.forEach((c, index) => {
        pdf.addText(
          `${index + 1} - ${c.firstName} ${c.lastName}`,
          23,
          320 + index * 20,
          250,
          {
            size: 10,
          },
        );
      });

      pdf.addText('Pax', 35, 500, 200, { size: 10 });
      pdf.doc.moveTo(30, 520).lineTo(60, 520).stroke(); // create line

      pdf.addText('Price', 90, 500, 200, { size: 10 });
      pdf.doc.moveTo(80, 520).lineTo(120, 520).stroke(); // create line
      pdf.addText(
        `${(
          Math.round((roomMap.buyAmount / roomMap.quantity / nights) * 100) /
          100
        ).toFixed(2)} USD`,
        85,
        523,
        150,
        {
          size: 10,
        },
      );

      pdf.addText('Accom.', 150, 500, 200, { size: 10 });
      pdf.doc.moveTo(140, 520).lineTo(190, 520).stroke(); // create line
      pdf.addText(`${nights} Nights`, 145, 523, 200, {
        size: 10,
      });

      pdf.addText('Room', 230, 500, 200, { size: 10 });
      pdf.doc.moveTo(220, 520).lineTo(260, 520).stroke(); // create line
      pdf.addText(`${roomMap.quantity} Room`, 223, 523, 250, {
        size: 10,
      });

      pdf.addText('Amount', 290, 500, 200, { size: 10 });
      pdf.doc.moveTo(280, 520).lineTo(330, 520).stroke(); // create line
      pdf.addText(`${roomMap.buyAmount} USD`, 285, 523, 150, {
        size: 10,
      });

      pdf.addText('Explanation', 420, 500, 200, { size: 10 });
      pdf.doc.moveTo(350, 520).lineTo(580, 520).stroke(); // create line

      pdf.doc.moveTo(280, 540).lineTo(330, 540).stroke(); /////// create line

      pdf.addText(`Transfer Price`, 190, 560, 200, {
        size: 10,
      });
      pdf.addText(`${transferAmount} USD`, 285, 560, 150, {
        size: 10,
      });

      pdf.addText(`Tour Price`, 190, 580, 200, {
        size: 10,
      });
      pdf.addText(`${tourAmount} USD`, 285, 580, 150, {
        size: 10,
      });

      pdf.doc.moveTo(280, 600).lineTo(330, 600).stroke(); // create line

      pdf.addText('Grand Total:', 190, 615, 200, { size: 10 });
      pdf.addText(`${invoice.buyAmount} USD`, 287, 615, 150, {
        size: 10,
      });

      footer(pdf, invoice);

      if (mapIndex < orderHotel.orderHotelMapRooms.length - 1) {
        pdf.addPage();
      }
    });

    if (orderIndex < invoice.orderHotels.length - 1) {
      pdf.addPage();
    }
  });

  if (invoice.orderHotels.length === 0 && invoice.orderTours.length > 0) {
    invoice.orderTours.forEach((orderTour, orderIndex) => {
      const invoiceCustomers = orderTour.invoiceCustomers;

      header(pdf, invoice, pageNumber++, hotel);

      pdf.addText(`HOTEL: -`, 30, 140, 200, {
        size: 10,
      });

      pdf.addText(
        `Tour Operator: ${invoice?.tourism?.name || '-'}`,
        30,
        160,
        200,
        {
          size: 10,
        },
      );

      pdf.addText(
        `Voucher: ${invoice.systemNumber || invoice.number || '-'}`,
        30,
        180,
        200,
        {
          size: 10,
        },
      );

      pdf.addText(
        `Inv.Nr: ${invoice.systemNumber || invoice.number}`,
        200,
        140,
        200,
        {
          size: 10,
        },
      );

      pdf.addText('Res.No: -', 300, 140, 200, {
        size: 10,
      });

      pdf.addText(`Accomodation: -`, 200, 160, 300, {
        size: 10,
      });

      pdf.addText(`Nights: -`, 240, 180, 200, {
        size: 10,
      });

      pdf.addText(`Room: -`, 400, 140, 250, {
        size: 10,
      });

      pdf.addText(`Type: -`, 400, 160, 250, {
        size: 10,
      });

      pdf.addText('Brd: -', 400, 180, 250, {
        size: 10,
      });

      pdf.addText('Voucher Note:', 30, 225, 200, { size: 10 });

      pdf.addText('** Special Price **', 300, 300, 200, { size: 10 });

      invoiceCustomers.forEach((c, index) => {
        pdf.addText(
          `${index + 1} - ${c.firstName} ${c.lastName}`,
          23,
          320 + index * 20,
          250,
          {
            size: 10,
          },
        );
      });

      pdf.addText('Pax', 35, 500, 200, { size: 10 });
      pdf.doc.moveTo(30, 520).lineTo(60, 520).stroke(); // create line

      pdf.addText('Price', 90, 500, 200, { size: 10 });
      pdf.doc.moveTo(80, 520).lineTo(120, 520).stroke(); // create line
      pdf.addText(`-`, 85, 523, 150, {
        size: 10,
      });

      pdf.addText('Accom.', 150, 500, 200, { size: 10 });
      pdf.doc.moveTo(140, 520).lineTo(190, 520).stroke(); // create line
      pdf.addText(`-`, 145, 523, 200, {
        size: 10,
      });

      pdf.addText('Room', 230, 500, 200, { size: 10 });
      pdf.doc.moveTo(220, 520).lineTo(260, 520).stroke(); // create line
      pdf.addText(`-`, 223, 523, 250, {
        size: 10,
      });

      pdf.addText('Amount', 290, 500, 200, { size: 10 });
      pdf.doc.moveTo(280, 520).lineTo(330, 520).stroke(); // create line
      pdf.addText(`-`, 285, 523, 150, {
        size: 10,
      });

      pdf.addText('Explanation', 420, 500, 200, { size: 10 });
      pdf.doc.moveTo(350, 520).lineTo(580, 520).stroke(); // create line

      pdf.doc.moveTo(280, 540).lineTo(330, 540).stroke(); /////// create line

      pdf.addText(`Transfer Price`, 190, 560, 200, {
        size: 10,
      });
      pdf.addText(`${transferAmount} USD`, 285, 560, 150, {
        size: 10,
      });

      pdf.addText(`Tour Price`, 190, 580, 200, {
        size: 10,
      });
      pdf.addText(`${tourAmount} USD`, 285, 580, 150, {
        size: 10,
      });

      pdf.doc.moveTo(280, 600).lineTo(330, 600).stroke(); // create line

      pdf.addText('Grand Total:', 190, 615, 200, { size: 10 });
      pdf.addText(`${invoice.buyAmount} USD`, 287, 615, 150, {
        size: 10,
      });

      footer(pdf, invoice);

      if (orderIndex < invoice.orderTours.length - 1) {
        pdf.addPage();
      }
    });
  }

  // add final page
  // pdf.addPage();
  // header(pdf, invoice, pageNumber++, hotel);
  // footer(pdf, invoice);

  // Finalize PDF file
  pdf.end();
  return filePath;
};

/**
 * *************************************************** header
 */
const logoImage = path.join(__dirname, '../../..', 'assets/images/logo.png');

const header = (pdf, invoice, pageNumber, hotel) => {
  pdf.addImage(logoImage, 20, 25, 100);

  if (hotel?.name) {
    pdf.addText(hotel?.name || '-', 0, 30, 600, {
      size: 14,
      align: 'center',
    });
  }

  pdf.addText('HOTEL ROOM BUY INVOICE', 0, 50, 600, {
    size: 14,
    align: 'center',
  });

  pdf.addText(
    `Print Date: ${moment(invoice.createdAt).format('MM/DD/YYYY')}`,
    470,
    30,
    200,
  );

  pdf.addText(
    `Time: ${moment(invoice.createdAt).format('H:mm:ss')}`,
    485,
    45,
    200,
  );

  pdf.addText(`Page: ${pageNumber}`, 485, 58, 200);
};

////////////////////////////////////////////////////////////////////
const footer = (pdf, invoice, offSet = 120) => {
  const transferAmount = invoice.transferBuyAmount;
  const tourAmount = invoice.orderTours.reduce(
    (sum, orderTour) => sum + orderTour.buyAmount,
    0,
  );
  const hotelAmount = invoice.orderHotels.reduce(
    (sum, orderHotel) => sum + orderHotel.buyAmount,
    0,
  );

  pdf.addText('HOTEL INVOICE TOTALS', 0, 580 + offSet, 600, {
    size: 13,
    align: 'center',
  });
  pdf.doc
    .moveTo(30, 600 + offSet)
    .lineTo(580, 600 + offSet)
    .stroke(); // create line

  pdf.addText('Curr', 34, 603 + offSet, 200, { size: 7 });
  pdf.doc
    .moveTo(30, 614 + offSet)
    .lineTo(100, 614 + offSet)
    .stroke(); // create line
  pdf.addText('USD', 34, 618 + offSet, 200, { size: 9 });

  pdf.addText('Accomodation', 56, 602 + offSet, 200, { size: 7 });
  pdf.addText(`${hotelAmount}`, 70, 618 + offSet, 150, {
    size: 9,
  });

  pdf.addText('Extras', 110, 602 + offSet, 200, { size: 7 });
  pdf.doc
    .moveTo(102, 614 + offSet)
    .lineTo(140, 614 + offSet)
    .stroke(); // create line

  pdf.addText('Transfer', 149, 602 + offSet, 200, { size: 7 });
  pdf.doc
    .moveTo(142, 614 + offSet)
    .lineTo(180, 614 + offSet)
    .stroke(); // create line

  pdf.addText(`${transferAmount}`, 150, 618 + offSet, 200, { size: 9 });

  pdf.addText('Hand.Fee Tour Packages', 184, 602 + offSet, 200, { size: 7 });
  pdf.doc
    .moveTo(182, 614 + offSet)
    .lineTo(262, 614 + offSet)
    .stroke(); // create line

  pdf.addText(`${tourAmount}`, 220, 618 + offSet, 200, { size: 9 });

  pdf.addText('Gen.Service', 270, 602 + offSet, 200, { size: 7 });
  pdf.doc
    .moveTo(264, 614 + offSet)
    .lineTo(314, 614 + offSet)
    .stroke(); // create line

  pdf.addText('Visa', 325, 602 + offSet, 200, { size: 7 });
  pdf.doc
    .moveTo(316, 614 + offSet)
    .lineTo(346, 614 + offSet)
    .stroke(); // create line

  pdf.addText('Rent a Car', 350, 602 + offSet, 200, { size: 7 });
  pdf.doc
    .moveTo(348, 614 + offSet)
    .lineTo(580, 614 + offSet)
    .stroke(); // create line

  pdf.addText('lnt.Flight', 390, 602 + offSet, 200, { size: 7 });

  pdf.addText('GRAND TOTALS', 430, 602 + offSet, 200, { size: 7 });

  pdf.addText('GRAND TOTALS (TRY)', 490, 602 + offSet, 200, { size: 7 });

  pdf.addText(`${invoice.buyAmount}`, 470, 618 + offSet, 150, {
    size: 9,
  });
};
