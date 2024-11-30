import * as moment from 'jalali-moment';
import * as path from 'path';
import { v4 as uuid } from 'uuid';
import { PDF } from 'src/utils/pdf';
import { OrderHotelEntity } from 'src/modules/order-hotel/entities/order-hotel.entity';
import { seperateChildAndAdultList } from 'src/utils';
import { SettingEntity } from '../../setting/entities/setting.entity';

export const generateReservePDF = (
  orderHotel: OrderHotelEntity,
  setting: SettingEntity,
) => {
  const logoImage = path.join(__dirname, '../../..', 'assets/images/logo.png');

  // Create a document
  const filePath = `/hotel_voucher/reserve_hotel_${uuid()}.pdf`;
  const pdf = new PDF(path.join(__dirname, '../../../..', 'uploads', filePath));

  let pageNumber = 1;

  orderHotel.orderHotelMapRooms.forEach((roomMap, index) => {
    const hotel = roomMap.hotelRoom.hotel;
    const room = roomMap.hotelRoom;

    pdf.addImage(logoImage, 20, 30, 100);

    pdf.addText(hotel.state, 0, 90, 600, {
      size: 11,
      align: 'center',
    });

    pdf.addText(
      `Date: ${moment(orderHotel.createdAt).format('MM/DD/YYYY')}`,
      500,
      30,
      200,
      {
        size: 10,
      },
    );

    pdf.addText(
      `Time: ${moment(orderHotel.createdAt).format('H:mm:ss')}`,
      500,
      45,
      200,
      {
        size: 10,
      },
    );

    pdf.addText(`Page: ${pageNumber++}`, 500, 58, 200, { size: 10 });

    pdf.addText(`Voucher No: ${orderHotel.number || '-'}`, 20, 115, 150);

    pdf.addText('NEW', 0, 125, 600, { size: 13, align: 'center' });

    const checkInMoment = moment(orderHotel.checkIn, 'YYYY-MM-DD');
    const checkOutMoment = moment(orderHotel.checkOut, 'YYYY-MM-DD');
    const nights = checkOutMoment.diff(checkInMoment, 'days');

    pdf.addText(
      `C/in Date: ${checkInMoment.format('MM/DD/YYYY')}`,
      20,
      150,
      150,
    );

    pdf.addText(
      `C/Out Date: ${checkOutMoment.format('MM/DD/YYYY')}`,
      20,
      170,
      150,
    );

    pdf.addText(`Day: ${nights}`, 20, 185, 150);
    pdf.addText('Sejour Card Nr: 1', 20, 210, 150);
    pdf.addText(`NOTE: ${roomMap.buyAmount} USD ${room.name} `, 20, 235, 150);

    pdf.addText('Room Count:', 200, 150, 150);
    pdf.addText(roomMap.quantity, 260, 150, 150);

    pdf.addText('Room:', 200, 170, 150);
    pdf.addText(room.name, 230, 170, 150);

    pdf.addText('Room Type:', 200, 190, 150);
    pdf.addText(room.type, 250, 190, 150);

    pdf.addText('Board: BB', 200, 210, 150);
    pdf.addText('status: Ok ', 200, 230, 150);

    const invoiceCustomers = roomMap.invoiceCustomers;
    const { childs, adults, infants } =
      seperateChildAndAdultList(invoiceCustomers);

    pdf.addText('Adult:', 450, 150, 150);
    pdf.addText(adults.length > 0 ? adults.length : '0', 480, 150, 150);

    const extraBed =
      adults.length + childs.length - roomMap.quantity * room.maxCapacity;

    pdf.addText('Ext.Bed:', 450, 170, 150);
    pdf.addText(extraBed > 0 ? extraBed : '0', 490, 170, 150);

    pdf.addText('Child:', 450, 190, 150);
    pdf.addText(childs.length > 0 ? childs.length : '0', 480, 190, 150);

    pdf.addText('Infant:', 450, 210, 150);
    pdf.addText(infants.length > 0 ? infants.length : '0', 480, 210, 150);

    pdf.addText('Total Pax:', 450, 230, 150);
    pdf.addText(invoiceCustomers.length, 490, 230, 150);

    pdf.addText('SURNAME, NAME', 20, 275, 200);
    pdf.addText('AGE/B.DATE', 200, 275, 200);
    pdf.addText('ARRIV.POINT', 275, 275, 200);
    pdf.addText('TIME', 365, 275, 50);
    pdf.addText('DEPAR.POINT', 430, 275, 200);
    pdf.addText('TIME', 525, 275, 50);

    pdf.doc.moveTo(20, 300).lineTo(575, 300).stroke(); // create line

    invoiceCustomers.forEach((invoiceCustomer, index) => {
      pdf.addText(
        `${invoiceCustomer.lastName}, ${invoiceCustomer.firstName}`,
        23,
        310 + index * 15,
        250,
      );

      if (invoiceCustomer.age > 0) {
        pdf.addText(
          `${+invoiceCustomer.age - 1}-${invoiceCustomer.age}`,
          220,
          310 + index * 15,
          250,
        );
      }
    });

    if (orderHotel.arrivalNumber) {
      pdf.addText(orderHotel.arrivalNumber, 275, 320, 100);
    }
    if (orderHotel.arrivalDate) {
      pdf.addText(
        moment(orderHotel.arrivalDate).format('MM/DD/YYYY'),
        365,
        320,
        100,
      );
    }

    if (orderHotel.departureNumber) {
      pdf.addText(orderHotel.departureNumber, 430, 320, 100);
    }
    if (orderHotel.departureDate) {
      pdf.addText(
        moment(orderHotel.departureDate).format('MM/DD/YYYY'),
        525,
        320,
        100,
      );
    }

    pdf.addText('Revise Description:', 20, 500, 600, {
      size: 11,
    });

    pdf.doc.moveTo(20, 530).lineTo(575, 530).stroke(); // create line

    pdf.addText('LIQO TRIP', 20, 540, 200);
    pdf.addText('REZERVASYONUN KONFIRMESI RICADIR', 20, 555, 200);
    pdf.addText(`TEL: ${setting.adminPhone}`, 20, 570, 200);
    pdf.addText(setting.adminName, 20, 585, 200);
    pdf.addText(`Hotel Tel No: ${hotel.phone}`, 20, 600, 200);

    pdf.addText('EXTRA ON TRAVELER', 400, 540, 200);
    pdf.addText(`Fax: ${setting.adminFax}`, 400, 555, 200);
    pdf.addText(`Mail: ${setting.adminEmail}`, 400, 570, 200);

    pdf.addText('LIQO TRIP', 0, 30, 600, { size: 12, align: 'center' });
    pdf.addText('HOTEL RESERVATION FORM', 0, 47, 600, {
      size: 13,
      align: 'center',
    });
    pdf.addText(hotel.name, 0, 64, 600, {
      size: 12,
      align: 'center',
    });

    if (index < orderHotel.orderHotelMapRooms.length - 1) {
      pdf.addPage();
    }
  });

  // Finalize PDF file
  pdf.end();

  return filePath;
};
