import * as moment from 'jalali-moment';
import * as path from 'path';
import { v4 as uuid } from 'uuid';
import { PDF } from 'src/utils/pdf';
import { OrderHotelEntity } from 'src/modules/order-hotel/entities/order-hotel.entity';
import { SettingEntity } from 'src/modules/setting/entities/setting.entity';

export const generatePassengerPDFV2 = (
  orderHotel: OrderHotelEntity,
  setting: SettingEntity,
) => {
  const ayBookingImage = path.join(
    __dirname,
    '../../..',
    'assets/images/voucher-passenger-v2.png',
  );

  // Create a document
  const filePath = `/hotel_voucher/voucher_passenger_hotel_${uuid()}.pdf`;
  const pdf = new PDF(path.join(__dirname, '../../../..', 'uploads', filePath));

  orderHotel.orderHotelMapRooms.forEach((roomMap, index) => {
    const hotel = roomMap.hotelRoom.hotel;
    const room = roomMap.hotelRoom;
    const invoiceCustomers = roomMap.invoiceCustomers;

    pdf.addImage(ayBookingImage, 0, 0, 600);

    // voucher number
    pdf.addText(orderHotel.number, 0, 93, 600, {
      size: 14,
      align: 'center',
    });

    pdf.addText(hotel.name, 170, 155, 350, {
      size: 12,
    });

    pdf.addText('B.B', 170, 202, 250, {
      size: 12,
    });

    pdf.addText(room.name, 310, 202, 250, {
      size: 12,
    });

    pdf.addText(room.type, 450, 202, 250, {
      size: 12,
    });

    const checkInMoment = moment(orderHotel.checkIn, 'YYYY-MM-DD');
    const checkOutMoment = moment(orderHotel.checkOut, 'YYYY-MM-DD');

    pdf.addText(checkInMoment.format('DD/MM/YYYY'), 170, 248, 250, {
      size: 12,
    });

    pdf.addText(checkOutMoment.format('DD/MM/YYYY'), 310, 248, 250, {
      size: 12,
    });

    const nights = checkOutMoment.diff(checkInMoment, 'days');

    pdf.addText(nights, 450, 248, 250, { size: 12 });

    if (orderHotel.arrivalDate) {
      pdf.addText(
        moment(orderHotel.arrivalDate).format('DD/MM/YYYY'),
        120,
        325,
        250,
        { size: 12 },
      );
      pdf.addText(
        moment(orderHotel.arrivalDate).format('HH:mm'),
        470,
        325,
        250,
        { size: 12 },
      );
    }

    if (orderHotel.departureDate) {
      pdf.addText(
        moment(orderHotel.departureDate).format('DD/MM/YYYY'),
        120,
        350,
        250,
        { size: 12 },
      );
      pdf.addText(
        moment(orderHotel.departureDate).format('HH:mm'),
        470,
        350,
        250,
        { size: 12 },
      );
    }

    pdf.addText(orderHotel.arrivalAirline || '', 240, 325, 250, { size: 12 });

    pdf.addText(orderHotel.departureAirline || '', 240, 350, 250, { size: 12 });

    pdf.addText(orderHotel.arrivalNumber || '', 350, 325, 250, { size: 12 });

    pdf.addText(orderHotel.departureNumber || '', 350, 350, 250, { size: 12 });

    if (orderHotel.arrivalDate) {
      pdf.addText(setting.transferBoard || '', 150, 430, 250, { size: 12 });
      pdf.addText(setting.transferPhone || '', 270, 427, 250, { size: 12 });
      pdf.addText(setting.transferPhone2 || '', 270, 440, 250, { size: 12 });
      pdf.addText(setting.transferExcursion || '', 420, 430, 250, { size: 12 });
    }

    if (invoiceCustomers?.[0]) {
      pdf.addText(
        `${invoiceCustomers[0].firstName} ${invoiceCustomers[0].lastName}`,
        120,
        501,
        250,
        {
          size: 11,
        },
      );
    }

    if (invoiceCustomers?.[1]) {
      pdf.addText(
        `${invoiceCustomers[1].firstName} ${invoiceCustomers[1].lastName}`,
        120,
        526,
        250,
        {
          size: 11,
        },
      );
    }

    if (invoiceCustomers?.[2]) {
      pdf.addText(
        `${invoiceCustomers[2].firstName} ${invoiceCustomers[2].lastName}`,
        120,
        551,
        250,
        {
          size: 11,
        },
      );
    }

    if (invoiceCustomers?.[3]) {
      pdf.addText(
        `${invoiceCustomers[3].firstName} ${invoiceCustomers[3].lastName}`,
        120,
        580,
        250,
        {
          size: 11,
        },
      );
    }

    if (invoiceCustomers?.[4]) {
      pdf.addText(
        `${invoiceCustomers[4].firstName} ${invoiceCustomers[4].lastName}`,
        335,
        475,
        250,
        {
          size: 11,
        },
      );
    }

    if (invoiceCustomers?.[5]) {
      pdf.addText(
        `${invoiceCustomers[5].firstName} ${invoiceCustomers[5].lastName}`,
        335,
        503,
        250,
        {
          size: 11,
        },
      );
    }

    if (invoiceCustomers?.[6]) {
      pdf.addText(
        `${invoiceCustomers[6].firstName} ${invoiceCustomers[6].lastName}`,
        335,
        528,
        250,
        {
          size: 11,
        },
      );
    }

    if (invoiceCustomers?.[7]) {
      pdf.addText(
        `${invoiceCustomers[7].firstName} ${invoiceCustomers[7].lastName}`,
        335,
        555,
        250,
        {
          size: 11,
        },
      );
    }

    if (invoiceCustomers?.[8]) {
      pdf.addText(
        `${invoiceCustomers[8].firstName} ${invoiceCustomers[8].lastName}`,
        335,
        580,
        250,
        {
          size: 11,
        },
      );
    }

    pdf.addText(
      setting.voucherDescription
        .replace(/\(/g, '(abc')
        .replace(/\)/g, '(')
        .replace(/\(abc/g, ')')
        .replace(/\r/g, '') || '',
      75,
      615,
      440,
      {
        size: 10,
        direction: 'rtl',
      },
    );

    if (index < orderHotel.orderHotelMapRooms.length - 1) {
      pdf.addPage();
    }
  });

  // Finalize PDF file
  pdf.end();

  return filePath;
};
