import { Factory, Seeder } from 'typeorm-seeding';
import { Connection } from 'typeorm';
import { PermissionEntity } from '../../modules/role/entities/permission.entity';
import { RoleMapPermissionEntity } from '../../modules/role/entities/role-map-permission.entity';

const adminRoleId = 1;

const permissions = [
  {
    name: 'مدیریت تنظیمات توسط ادمین',
    description: null,
    type: 'GET_SETTING',
    category: 'تنظیمات سیستم',
  },
  {
    name: 'ویرایش تنظیمات توسط ادمین',
    description: null,
    type: 'UPDATE_SETTING',
    category: 'تنظیمات سیستم',
  },

  {
    name: 'دیدن واحد ارزی',
    description: null,
    type: 'GET_CURRENCY',
    category: 'واحدهای پولی',
  },
  {
    name: 'ثبت واحد ارزی جدید',
    description: null,
    type: 'ADD_CURRENCY',
    category: 'واحدهای پولی',
  },
  {
    name: 'ویرایش واحد ارزی',
    description: null,
    type: 'UPDATE_CURRENCY',
    category: 'واحدهای پولی',
  },
  {
    name: 'حذف واحد ارزی',
    description: null,
    type: 'DELETE_CURRENCY',
    category: 'واحدهای پولی',
  },

  {
    name: 'دیدن جزئیات نقش',
    description: null,
    type: 'GET_ROLE',
    category: 'نقش ها',
  },
  {
    name: 'ویرایش نقش',
    description: null,
    type: 'UPDATE_ROLE',
    category: 'نقش ها',
  },
  {
    name: 'ثبت نقش جدید',
    description: null,
    type: 'ADD_ROLE',
    category: 'نقش ها',
  },
  {
    name: 'حذف نقش',
    description: null,
    type: 'DELETE_ROLE',
    category: 'نقش ها',
  },
  {
    name: 'افزودن گروه بندی جدید آژانس',
    description: null,
    type: 'ADD_TOURISM_LEVEL',
    category: 'گروه بندی',
  },
  {
    name: 'ویرایش گروه بندی آژانس',
    description: null,
    type: 'UPDATE_TOURISM_LEVEL',
    category: 'گروه بندی',
  },
  {
    name: 'حذف گروه بندی آژانس',
    description: null,
    type: 'DELETE_TOURISM_LEVEL',
    category: 'گروه بندی',
  },
  {
    name: 'دیدن گروه بندی آژانس',
    description: null,
    type: 'GET_TOURISM_LEVEL',
    category: 'گروه بندی',
  },
  {
    name: 'ثبت کاربر جدید توسط ادمین',
    description: null,
    type: 'ADD_USER',
    category: 'کاربران',
  },
  {
    name: 'دیدن اطلاعات کاربر توسط ادمین',
    description: null,
    type: 'GET_USER',
    category: 'کاربران',
  },
  {
    name: 'ویرایش اطلاعات کاربر توسط ادمین',
    description: null,
    type: 'UPDATE_USER',
    category: 'کاربران',
  },
  {
    name: 'ایجاد آژانس و مدیر آژانس جدید توسط بازاریاب',
    description: null,
    type: 'ADD_TOURISM_MANAGER',
    category: 'کاربران',
  },
  {
    name: 'مشاهده اطلاعات کاربران آژانس توسط بازاریاب',
    description: null,
    type: 'GET_USER_TOURISM',
    category: 'کاربران',
  },
  {
    name: 'ویرایش اطلاعات کاربران آژانس توسط بازاریاب',
    description: null,
    type: 'UPDATE_USER_TOURISM',
    category: 'کاربران',
  },
  {
    name: 'ایجاد کارمند آژانس توسط مدیر آژانس',
    description: null,
    type: 'ADD_TOURISM_EMPLOYEE',
    category: 'کاربران',
  },
  {
    name: 'ویرایش اطلاعات کارمندان توسط مدیر آژانس',
    description: null,
    type: 'UPDATE_TOURISM_EMPLOYEE',
    category: 'کاربران',
  },
  {
    name: 'مشاهده اطلاعات کارمندان توسط مدیر آژانس',
    description: null,
    type: 'GET_TOURISM_EMPLOYEE',
    category: 'کاربران',
  },
  {
    name: 'تعیین وضعیت درخواست وجه توسط ادمین',
    description: null,
    type: 'UPDATE_STATUS_WITHDRAW',
    category: 'مالی',
  },
  {
    name: 'مشاهده درخواست وجه توسط ادمین یا آژانس',
    description: null,
    type: 'GET_WITHDRAW',
    category: 'مالی',
  },
  {
    name: 'ایجاد درخواست برداشت وجه توسط آژانس',
    description: null,
    type: 'ADD_WITHDRAW',
    category: 'مالی',
  },
  {
    name: 'لغو درخواست برداشت وجه توسط آژانس',
    description: 'فقط در وضعیت معلق',
    type: 'CANCEL_TOURISM_WITHDRAW',
    category: 'مالی',
  },
  {
    name: 'مشاهده تاریخچه کیف پول کاربر ',
    description: null,
    type: 'GET_USER_WALLET_HISTORY',
    category: 'مالی',
  },
  {
    name: 'دیدن مشخصات مشتری توسط ادمین و آژانس',
    description: null,
    type: 'GET_CUSTOMER',
    category: 'مشتریان',
  },
  {
    name: 'ثبت مشتری جدید توسط ادمین و آژانس',
    description: null,
    type: 'ADD_CUSTOMER',
    category: 'مشتریان',
  },
  {
    name: 'ویرایش اطلاعات مشتری توسط ادمین و آژانس',
    description: null,
    type: 'UPDATE_CUSTOMER',
    category: 'مشتریان',
  },
  {
    name: 'اطلاعات مشتری از طریق پاسپورت یا کدملی',
    description: null,
    type: 'GET_CUSTOMER_PASSPORT_IDENTIFY',
    category: 'مشتریان',
  },
  {
    name: 'دیدن اطلاعات آژانس توسط ادمین',
    description: null,
    type: 'GET_TOURISM',
    category: 'آژانس های مسافربری',
  },
  {
    name: 'ویرایش اطلاعات آژانس توسط ادمین',
    description: null,
    type: 'UPDATE_TOURISM',
    category: 'آژانس های مسافربری',
  },
  {
    name: 'شارژ کیف پول آژانس',
    description: null,
    type: 'UPDATE_TOURISM_WALLET',
    category: 'آژانس های مسافربری',
  },
  {
    name: 'مشاهده اطلاعات آژانس توسط بازاریاب',
    description: null,
    type: 'GET_TOURISM_BY_MARKETER',
    category: 'آژانس های مسافربری',
  },
  {
    name: 'افزودن آژانس جدید توسط بازاریاب',
    description: null,
    type: 'ADD_TOURISM_BY_MARKETER',
    category: 'آژانس های مسافربری',
  },
  {
    name: 'ویرایش اطلاعات آژانس توسط بازاریاب',
    description: null,
    type: 'UPDATE_TOURISM_BY_MARKETER',
    category: 'آژانس های مسافربری',
  },

  {
    name: 'دیدن جزئیات هتل',
    description: null,
    type: 'GET_HOTEL',
    category: 'هتل ها',
  },
  {
    name: 'افزودن هتل',
    description: null,
    type: 'ADD_HOTEL',
    category: 'هتل ها',
  },
  {
    name: 'ویرایش هتل توسط ادمین',
    description: null,
    type: 'UPDATE_HOTEL',
    category: 'هتل ها',
  },
  {
    name: 'ویرایش اطلاعات هتل توسط کارشناس محتوا',
    description: null,
    type: 'UPDATE_CONTENT_HOTEL',
    category: 'هتل ها',
  },
  {
    name: 'حذف عکس هتل',
    description: null,
    type: 'DELETE_HOTEL_IMAGE',
    category: 'هتل ها',
  },
  {
    name: 'ویرایش اطلاعات اتاق هتل توسط ادمین',
    description: 'ویرایش اتاق هتل که شامل وضعیت اتاق می باشد.',
    type: 'UPDATE_ROOM',
    category: 'اتاق هتل',
  },
  {
    name: 'ویرایش اطلاعات اتاق هتل توسط کارشناس محتوا',
    description: 'ویرایش اتاق هتل که شامل نام اتاق و تعداد تخت می باشد',
    type: 'UPDATE_CONTENT_ROOM',
    category: 'اتاق هتل',
  },
  {
    name: 'ویرایش موجودی اتاق هتل',
    description: null,
    type: 'UPDATE_AVAILABILITY_ROOM',
    category: 'اتاق هتل',
  },
  {
    name: 'گرفتن موجودی اتاق هتل',
    description: null,
    type: 'GET_AVAILABILITY_ROOM',
    category: 'اتاق هتل',
  },
  {
    name: 'ویرایش قیمت یک اتاق هتل',
    description: null,
    type: 'UPDATE_ROOM_PRICE',
    category: 'اتاق هتل',
  },
  {
    name: 'مشاهده اطلاعات ویژگی هتل',
    description: null,
    type: 'GET_HOTEL_FEATURE',
    category: 'هتل ها',
  },
  {
    name: 'افزودن یک ویژگی هتل',
    description: null,
    type: 'ADD_HOTEL_FEATURE',
    category: 'هتل ها',
  },
  {
    name: 'ویرایش یک ویژگی هتل',
    description: null,
    type: 'UPDATE_HOTEL_FEATURE',
    category: 'هتل ها',
  },
  {
    name: 'حذف یک ویژگی هتل',
    description: null,
    type: 'DELETE_HOTEL_FEATURE',
    category: 'هتل ها',
  },
  {
    name: 'مشاهده فاکتور توسط آژانس و ادمین',
    description: null,
    type: 'GET_INVOICE',
    category: 'مالی',
  },
  {
    name: 'تعیین وضعیت فاکتور توسط ادمین',
    description: null,
    type: 'UPDATE_INVOICE',
    category: 'مالی',
  },
  {
    name: 'تعیین وضعیت موجودی اتاق توسط ادمین',
    description: null,
    type: 'UPDATE_AVAILABILITY_STATUS_ROOM',
    category: 'اتاق هتل',
  },
  {
    name: 'ایجاد فاکتور جدید توسط آژانس',
    description: null,
    type: 'ADD_INVOICE',
    category: 'مالی',
  },
  {
    name: 'مشاهده سفارش های هتل توسط آژانس و ادمین',
    description: null,
    type: 'GET_ORDER_HOTEL',
    category: 'سفارشات هتل',
  },
  {
    name: 'ایجاد سفارش هتل توسط آژانس',
    description: null,
    type: 'ADD_ORDER_HOTEL',
    category: 'سفارشات هتل',
  },
  {
    name: 'ثبت پیشنهاد هتل توسط ادمین',
    description: null,
    type: 'ADD_HOTEL_OFFER',
    category: 'هتل ها',
  },
  {
    name: 'مشاهده پیشنهادات هتل ها توسط ادمین',
    description: null,
    type: 'GET_HOTEL_OFFER',
    category: 'هتل ها',
  },
  {
    name: 'مشاهده اطلاعات پیشنهاد هتل ها توسط مدیر آژانس',
    description: null,
    type: 'GET_HOTEL_OFFER_BY_TOURISM',
    category: 'هتل ها',
  },
  {
    name: 'ویرایش یک پیشنهاد خاص توسط ادمین',
    description: null,
    type: 'UPDATE_HOTEL_OFFER',
    category: 'هتل ها',
  },
  {
    name: 'حذف یک پیشنهاد خاص توسط ادمین',
    description: null,
    type: 'DELETE_HOTEL_OFFER',
    category: 'هتل ها',
  },
  {
    name: 'مشاهده آمار رزرو هتل،  توسط ادمین',
    description: null,
    type: 'GET_INVOICE_STATISTICS',
    category: 'آمارها',
  },
  {
    name: 'مشاهده آمار اتاق های رزرو شده ، توسط ادمین',
    description: null,
    type: 'GET_ROOM_STATISTICS',
    category: 'آمارها',
  },
  {
    name: 'مشاهده پرداخت ها توسط ادمین یا مدیر آژانس',
    description: null,
    type: 'GET_PAYMENT',
    category: 'مالی',
  },
  {
    name: 'افزودن اتاق به سفارش توسط ادمین یا آژانس',
    description: null,
    type: 'ADD_ROOM_ORDER_HOTEL',
    category: 'سفارشات هتل',
  },
  {
    name: 'حذف اتاق از سفارش، توسط ادمین یا کاربر آژانس',
    description: null,
    type: 'DELETE_ROOM_ORDER_HOTEL',
    category: 'سفارشات هتل',
  },
  {
    name: 'دیدن گروه بندی آژانس توسط ادمین',
    description: null,
    type: 'GET_TOURISM_LEVEL_BY_ADMIN',
    category: 'گروه بندی',
  },
  {
    name: 'مشاهده اطلاعات تورها توسط ادمین یا مدیر آژانس',
    description: null,
    type: 'GET_TOUR',
    category: 'تورها',
  },
  {
    name: 'ایجاد تور توسط ادمین یا کارشناس تولید محتوا',
    description: null,
    type: 'ADD_TOUR',
    category: 'تورها',
  },
  {
    name: 'ویرایش تور توسط ادمین',
    description: null,
    type: 'UPDATE_TOUR',
    category: 'تورها',
  },
  {
    name: 'ویرایش اطلاعات تور توسط کارشناس تولید محتوا',
    description: null,
    type: 'UPDATE_CONTENT_TOUR',
    category: 'تورها',
  },
  {
    name: 'حذف عکس تور توسط ادمین یا کارشناس تولید محتوا',
    description: null,
    type: 'DELETE_TOUR_IMAGE',
    category: 'تورها',
  },
  {
    name: 'ثبت/ویرایش قیمت تور ادمین یا کارشناس فروش',
    description: null,
    type: 'UPDATE_PRICE_TOUR',
    category: 'تورها',
  },
  {
    name: 'مشاهده ویژگی تور توسط ادمین یا کارشناس محتوا',
    description: null,
    type: 'GET_TOUR_FEATURE',
    category: 'تورها',
  },
  {
    name: 'اضافه کردن ویژگی تور توسط ادمین یا محتوا',
    description: null,
    type: 'ADD_TOUR_FEATURE',
    category: 'تورها',
  },
  {
    name: 'ویرایش یک ویژگی از تور',
    description: null,
    type: 'UPDATE_TOUR_FEATURE',
    category: 'تورها',
  },
  {
    name: 'حذف یک ویژگی از تور',
    description: null,
    type: 'DELETE_TOUR_FEATURE',
    category: 'تورها',
  },
  {
    name: 'ویرایش موجودی تور توسط کارشناس فروش',
    description: null,
    type: 'UPDATE_AVAILABILITY_TOUR',
    category: 'تورها',
  },
  {
    name: 'مشاهده قیمت های یک تور برای تمام سطوح',
    description: null,
    type: 'GET_TOUR_PRICE',
    category: 'تورها',
  },
  {
    name: 'ثبت سفارش تور جدید توسط کارمنذ آژانس',
    description: null,
    type: 'ADD_ORDER_TOUR',
    category: 'سفارشات تور',
  },
  {
    name: 'مشاهده سفارش های تور توسط ادمین',
    description: null,
    type: 'GET_ORDER_TOUR',
    category: 'سفارشات تور',
  },
  {
    name: 'حذف یک سفارش تور توسط ادمین یا مدیر آژانس',
    description: null,
    type: 'DELETE_ORDER_TOUR',
    category: 'سفارشات تور',
  },
  {
    name: 'گرفتن اطلاعات مالی هتل',
    description: null,
    type: 'GET_FINANCIAL_INFO_HOTEL',
    category: 'مالی',
  },
  {
    name: 'گرفتن اطلاعات مالی تور',
    description: null,
    type: 'GET_FINANCIAL_INFO_TOUR',
    category: 'مالی',
  },
  {
    name: 'گرفتن واحدهای ارزی فعال',
    description: null,
    type: 'GET_ACTIVE_CURRENCY',
    category: 'واحدهای پولی',
  },
  {
    name: 'حذف ویدئوی هتل',
    description: null,
    type: 'DELETE_HOTEL_VIDEO',
    category: 'هتل ها',
  },
  {
    name: 'ویرایش وضعیت حواله بانکی',
    description: null,
    type: 'UPDATE_PAYMENT',
    category: 'مالی',
  },

  {
    name: 'مدیریت مسافران',
    description: null,
    type: 'MANAGE_CUSTOMER',
    category: 'مسافران',
  },
  {
    name: 'مدیریت هتل‌ها',
    description: null,
    type: 'MANAGE_HOTEL',
    category: 'هتل ها',
  },
  {
    name: 'مدیریت تور‌ها',
    description: null,
    type: 'MANAGE_TOUR',
    category: 'تورها',
  },

  {
    name: 'اضافه کردن یک اسلایدر توسط ادمین',
    description: null,
    type: 'ADD_SLIDER',
    category: 'اسلایدر',
  },
  {
    name: 'مشاهده اسلایدر توسط ادمین',
    description: null,
    type: 'GET_SLIDER',
    category: 'اسلایدر',
  },
  {
    name: 'مشاهده اسلایدرها توسط آژانس ها',
    description: null,
    type: 'GET_SLIDER_BY_TOURISM',
    category: 'اسلایدر',
  },
  {
    name: 'حذف کردن یک اسلایدر',
    description: null,
    type: 'DELETE_SLIDER',
    category: 'اسلایدر',
  },
  {
    name: 'ویرایش یک اسلایدر',
    description: null,
    type: 'UPDATE_SLIDER',
    category: 'اسلایدر',
  },
  {
    name: 'ارسال ایمیل به هتل',
    description: null,
    type: 'SEND_EMAIL_TO_HOTEL',
    category: 'هتل ها',
  },
  {
    name: 'دریافت درخواست های ثبت نام توسط ادمین',
    description: null,
    type: 'GET_SIGNUP_REQUEST',
    category: 'آژانس های مسافربری',
  },
  {
    name: 'تعیین وضعیت درخواست ثبت نام توسط ادمین',
    description: null,
    type: 'UPDATE_SIGNUP_REQUEST',
    category: 'آژانس های مسافربری',
  },
  {
    name: 'افزودن ترنسفر',
    description: null,
    type: 'ADD_TRANSFER',
    category: 'ترنسفر',
  },
  {
    name: 'گرفتن ترنسفر',
    description: null,
    type: 'GET_TRANSFER',
    category: 'ترنسفر',
  },
  {
    name: 'ویرایش ترنسفر',
    description: null,
    type: 'UPDATE_TRANSFER',
    category: 'ترنسفر',
  },
  {
    name: 'گرفتن اطلاعات مالی ترنسفر',
    description: null,
    type: 'GET_FINANCIAL_INFO_TRANSFER',
    category: 'ترنسفر',
  },
];

export default class CreatePermission implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<void> {
    const existPermissions = await connection
      .getRepository(PermissionEntity)
      .find();

    for (let i = 0; i < permissions.length; i++) {
      const permission = permissions[i];

      const existPermission = existPermissions.find(
        (ep) => ep.type === permission.type,
      );

      if (existPermission) {
        if (
          existPermission.name !== permission.name ||
          existPermission.category !== permission.category
        ) {
          await connection
            .createQueryBuilder()
            .update(PermissionEntity)
            .set({ name: permission.name, category: permission.category })
            .where({ id: existPermission.id })
            .execute();
        }
      } else {
        const {
          raw: { insertId },
        } = await connection
          .createQueryBuilder()
          .insert()
          .into(PermissionEntity)
          .values(permission)
          .execute();

        const newPermissionId = insertId;

        await connection
          .createQueryBuilder()
          .insert()
          .into(RoleMapPermissionEntity)
          .values({ permissionId: newPermissionId, roleId: adminRoleId })
          .execute();
      }
    }

    console.log('RUN PERMISSION SEED SUCCESSFULY');
  }
}
