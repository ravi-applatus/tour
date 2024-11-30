import * as moment from 'jalali-moment';
import * as path from 'path';
import { v4 as uuid } from 'uuid';
import { PDF } from 'src/utils/pdf';
import { seperateChildAndAdultList } from 'src/utils';
import { OrderHotelEntity } from 'src/modules/order-hotel/entities/order-hotel.entity';
import { TourismEntity } from 'src/modules/tourism/entities/tourism.entity';

export const generatePassengerPDF = (
  orderHotel: OrderHotelEntity,
  tourism: TourismEntity,
) => {
  const ayBookingImage = path.join(
    __dirname,
    '../../..',
    'assets/images/logo.png',
  );

  // Create a document
  const filePath = `/hotel_voucher/voucher_passenger_hotel_${uuid()}.pdf`;
  const pdf = new PDF(path.join(__dirname, '../../../..', 'uploads', filePath));

  orderHotel.orderHotelMapRooms.forEach((roomMap, index) => {
    const hotel = roomMap.hotelRoom.hotel;
    const room = roomMap.hotelRoom;
    const invoiceCustomers = roomMap.invoiceCustomers;

    pdf.addImage(ayBookingImage, 20, 25, 150);

    pdf.addText('AY BOOKING GROUP', 0, 30, 600, {
      size: 14,
      align: 'center',
    });

    pdf.addText('VOUCHER FORM', 0, 50, 600, {
      size: 14,
      align: 'center',
    });

    pdf.doc.rect(20, 100, 555, 15).fill('#c0c0c0'); //////////////////// grey box

    const y = 100;
    pdf.addText(`Voucher No: ${orderHotel.number || '-'}`, 23, y, 150, {
      size: 12,
    });

    pdf.addText('Agency Name', 0, y, 600, { size: 12, align: 'center' });

    pdf.addText('Print Date', 440, y, 200, {
      size: 12,
    });

    pdf.addText('Time', 530, y, 200, {
      size: 12,
    });

    // voucher number
    pdf.addText('-', 23, 120, 150, {
      size: 11,
    });

    pdf.addText('AVAYE ARVAND', 0, 120, 600, {
      size: 11,
      align: 'center',
    });

    pdf.addText(
      moment(orderHotel.createdAt).format('MM/DD/YYYY'),
      440,
      120,
      150,
      {
        size: 11,
      },
    );

    pdf.addText(moment(orderHotel.createdAt).format('H:mm:ss'), 530, 120, 150, {
      size: 11,
    });

    pdf.doc.rect(20, 150, 555, 15).fill('#c0c0c0'); //////////////////// grey box

    pdf.addText('Customer Name', 140, 150, 200, {
      size: 12,
    });

    pdf.addText(
      invoiceCustomers.map((c) => `${c.firstName} ${c.lastName}`).join(' - '),
      23,
      170,
      250,
      {
        size: 11,
      },
    );

    const { childs, adults, infants } =
      seperateChildAndAdultList(invoiceCustomers);

    pdf.addText('Adult', 335, 150, 200, {
      size: 12,
    });

    pdf.addText(adults.length > 0 ? adults.length : '0', 340, 170, 200, {
      size: 12,
    });

    pdf.addText('Extra Bed', 385, 150, 200, {
      size: 12,
    });

    const extraBed = invoiceCustomers.length - room.maxCapacity;

    pdf.addText(extraBed > 0 ? extraBed : '0', 390, 170, 200, {
      size: 12,
    });

    pdf.addText('Child', 445, 150, 200, {
      size: 12,
    });

    pdf.addText(childs.length > 0 ? childs.length : '0', 450, 170, 200, {
      size: 12,
    });

    pdf.addText('Infant', 495, 150, 200, {
      size: 12,
    });

    pdf.addText(infants.length > 0 ? infants.length : '0', 500, 170, 200, {
      size: 12,
    });

    pdf.addText('0', 500, 170, 200, {
      size: 12,
    });

    pdf.addText('Total', 545, 150, 200, {
      size: 12,
    });

    pdf.addText(invoiceCustomers.length, 550, 170, 200, {
      size: 12,
    });

    pdf.addText('Service Definition', 23, 280, 200, {
      size: 12,
    });

    pdf.doc.rect(20, 300, 555, 15).fill('#c0c0c0'); //////////////////// grey box

    pdf.addText('Hotel', 130, 300, 200, {
      size: 12,
    });

    pdf.addText('Address', 420, 300, 200, {
      size: 12,
    });

    pdf.addText(hotel.name, 23, 320, 250, {
      size: 11,
    });
    pdf.addText(hotel.address, 400, 320, 250, {
      size: 11,
    });

    pdf.doc.rect(20, 340, 555, 15).fill('#c0c0c0'); //////////////////// grey box

    pdf.addText('Room', 75, 340, 200, {
      size: 12,
    });

    pdf.addText('Room Type', 0, 340, 600, {
      size: 12,
      align: 'center',
    });

    pdf.addText('Board', 500, 340, 200, {
      size: 12,
    });

    pdf.addText(room.name, 50, 360, 250, {
      size: 11,
    });

    pdf.addText(room.type, 0, 360, 600, {
      size: 11,
      align: 'center',
    });

    pdf.addText('BED AND BREAKFAST', 460, 360, 200, {
      size: 11,
    });

    pdf.doc.rect(20, 390, 555, 15).fill('#c0c0c0'); //////////////////// grey box

    const checkInMoment = moment(orderHotel.checkIn, 'YYYY-MM-DD');
    const checkOutMoment = moment(orderHotel.checkOut, 'YYYY-MM-DD');

    pdf.addText('C/in Date', 150, 390, 200, {
      size: 12,
    });

    pdf.addText('C/Out Date', 225, 390, 200, {
      size: 12,
    });

    pdf.addText(checkInMoment.format('MM/DD/YYYY'), 150, 410, 150);

    pdf.addText(checkOutMoment.format('MM/DD/YYYY'), 225, 410, 150);

    pdf.addText('Room Count', 325, 390, 200, {
      size: 12,
    });

    pdf.addText(roomMap.quantity, 340, 410, 250, {
      size: 11,
    });

    pdf.addText('Overnight', 420, 390, 200, {
      size: 12,
    });

    const nights = checkOutMoment.diff(checkInMoment, 'days');

    pdf.addText(nights, 435, 410, 150, { size: 11 });

    pdf.addText(
      'Other Services: Arrival Transfer / Departure Transfer',
      50,
      430,
      400,
      {
        size: 11,
      },
    );

    // ${roomMap.amount} USD ${room.name}
    pdf.addText(`Hotel Note:`, 50, 450, 150, {
      size: 11,
    });

    pdf.addText('Flight Details: -----', 50, 470, 400, {
      size: 11,
    });

    pdf.addText('CALL CENTER', 25, 495, 400, {
      size: 11,
    });

    pdf.addText('0090 549 711 59 12 SUPPORT', 25, 515, 400, {
      size: 11,
    });

    pdf.addText('BOARD: ----', 350, 515, 400, {
      size: 11,
    });

    pdf.addText('0090 506 159 19 53 POUYAN', 25, 535, 400, {
      size: 11,
    });

    pdf.doc.rect(20, 570, 555, 100).dash(2, { space: 5 }).stroke(); /////////////// dash line box

    pdf.addText('Agency Address', 0, 575, 600, {
      size: 11,
      align: 'center',
    });

    if (tourism) {
      pdf.addText(tourism.address, 0, 590, 600, {
        size: 11,
        align: 'center',
      });

      pdf.addText(`Phone: ${tourism.phone}`, 0, 620, 600, {
        size: 11,
        align: 'center',
      });
    }

    pdf.addText('Fax: 0212 238 20 12', 0, 640, 600, {
      size: 11,
      align: 'center',
    });

    // voucher number
    pdf.addText(`Voucher: ----`, 23, 675, 200, {
      size: 11,
    });

    pdf.addText('Customer Name List', 23, 690, 250, {
      size: 11,
    });

    pdf.doc.moveTo(25, 710).lineTo(110, 710).stroke(); // create line

    pdf.addText(
      invoiceCustomers.map((c) => `${c.firstName} ${c.lastName}`).join(' - '),
      23,
      720,
      250,
      {
        size: 11,
      },
    );

    pdf.addText('Flight Details', 350, 690, 250, {
      size: 11,
    });

    pdf.doc.moveTo(350, 710).lineTo(420, 710).stroke(); // create line

    pdf.addText('EP 512 EP 513', 350, 720, 250, {
      size: 11,
    });

    pdf.addText('EP 512 EP 513', 350, 730, 250, {
      size: 11,
    });

    if (index < orderHotel.orderHotelMapRooms.length - 1) {
      pdf.addPage();
    }
  });

  // Finalize PDF file
  pdf.end();

  return filePath;
};
