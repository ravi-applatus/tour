import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RoleMapPermissionEntity } from './role-map-permission.entity';
// import { RoleMapPermission } from './RoleMapPermission';

export enum PermissionsType {
  GET_SETTING = 'GET_SETTING', // by admin
  UPDATE_SETTING = 'UPDATE_SETTING', // by admin

  GET_USER = 'GET_USER', // by admin
  GET_USER_TOURISM = 'GET_USER_TOURISM', // by marketer (fetching manager and employees of tourism)
  GET_TOURISM_EMPLOYEE = 'GET_TOURISM_EMPLOYEE', // by tourism manager

  ADD_USER = 'ADD_USER', // by admin
  ADD_TOURISM_MANAGER = 'ADD_TOURISM_MANAGER', // by marketer
  ADD_TOURISM_EMPLOYEE = 'ADD_TOURISM_EMPLOYEE', // by tourism manager

  UPDATE_USER = 'UPDATE_USER', // by admin
  UPDATE_USER_TOURISM = 'UPDATE_USER_TOURISM', // by marketer (updating manager and employees of tourism)
  UPDATE_TOURISM_EMPLOYEE = 'UPDATE_TOURISM_EMPLOYEE', // by tourism manager

  GET_TOURISM = 'GET_TOURISM', // by admin
  GET_TOURISM_BY_MARKETER = 'GET_TOURISM_BY_MARKETER', // by marketer

  UPDATE_TOURISM = 'UPDATE_TOURISM', // by admin
  UPDATE_TOURISM_WALLET = 'UPDATE_TOURISM_WALLET', // by admin
  UPDATE_TOURISM_BY_MARKETER = 'UPDATE_TOURISM_BY_MARKETER', // by marketer

  ADD_TOURISM_BY_MARKETER = 'ADD_TOURISM_BY_MARKETER', // by marketer

  ADD_TOURISM_LEVEL = 'ADD_TOURISM_LEVEL', // by admin
  GET_TOURISM_LEVEL_BY_ADMIN = 'GET_TOURISM_LEVEL_BY_ADMIN', // by admin
  UPDATE_TOURISM_LEVEL = 'UPDATE_TOURISM_LEVEL', // by admin
  DELETE_TOURISM_LEVEL = 'DELETE_TOURISM_LEVEL', // by admin
  GET_TOURISM_LEVEL = 'GET_TOURISM_LEVEL', // by sales manager

  GET_ROLE = 'GET_ROLE', // by admin
  UPDATE_ROLE = 'UPDATE_ROLE', // by admin
  ADD_ROLE = 'ADD_ROLE', // by admin
  DELETE_ROLE = 'DELETE_ROLE', // by admin

  ADD_HOTEL = 'ADD_HOTEL', // by admin
  GET_HOTEL = 'GET_HOTEL', // by admin
  UPDATE_HOTEL = 'UPDATE_HOTEL', // by admin
  GET_FINANCIAL_INFO_HOTEL = 'GET_FINANCIAL_INFO_HOTEL',

  DELETE_HOTEL_IMAGE = 'DELETE_HOTEL_IMAGE', // by admin or content
  DELETE_HOTEL_VIDEO = 'DELETE_HOTEL_VIDEO',

  GET_HOTEL_FEATURE = 'GET_HOTEL_FEATURE', // by admin or content
  ADD_HOTEL_FEATURE = 'ADD_HOTEL_FEATURE', // by admin or content
  UPDATE_HOTEL_FEATURE = 'UPDATE_HOTEL_FEATURE', // by admin or content
  DELETE_HOTEL_FEATURE = 'DELETE_HOTEL_FEATURE', // by admin or content

  UPDATE_CONTENT_HOTEL = 'UPDATE_CONTENT_HOTEL', // by content

  UPDATE_ROOM = 'UPDATE_ROOM', // by admin
  UPDATE_CONTENT_ROOM = 'UPDATE_CONTENT_ROOM', // by content
  UPDATE_AVAILABILITY_ROOM = 'UPDATE_AVAILABILITY_ROOM', // by admin or sales manager
  GET_AVAILABILITY_ROOM = 'GET_AVAILABILITY_ROOM', // by admin or sales manager

  UPDATE_ROOM_PRICE = 'UPDATE_ROOM_PRICE', // by admin or sale manager

  ADD_CURRENCY = 'ADD_CURRENCY', // by admin
  GET_CURRENCY = 'GET_CURRENCY', // by admin
  UPDATE_CURRENCY = 'UPDATE_CURRENCY', // by admin
  DELETE_CURRENCY = 'DELETE_CURRENCY', // by admin

  ADD_CUSTOMER = 'ADD_CUSTOMER', // by tourism manager or employee
  GET_CUSTOMER = 'GET_CUSTOMER', // by tourism manager or employee
  UPDATE_CUSTOMER = 'UPDATE_CUSTOMER', // by tourism manager or employee
  GET_CUSTOMER_PASSPORT_IDENTIFY = 'GET_CUSTOMER_PASSPORT_IDENTIFY', // by tourism manager or employee

  GET_WITHDRAW = 'GET_WITHDRAW', // by tourism manager
  ADD_WITHDRAW = 'ADD_WITHDRAW', // by tourism manager
  CANCEL_TOURISM_WITHDRAW = 'CANCEL_TOURISM_WITHDRAW', // by tourism manager
  UPDATE_STATUS_WITHDRAW = 'UPDATE_STATUS_WITHDRAW', // by admin

  GET_USER_WALLET_HISTORY = 'GET_USER_WALLET_HISTORY', // by admin  and tourism manager

  ADD_ORDER_HOTEL = 'ADD_ORDER_HOTEL', // by tourism employee
  GET_ORDER_HOTEL = 'GET_ORDER_HOTEL', // by admin

  ADD_ROOM_ORDER_HOTEL = 'ADD_ROOM_ORDER_HOTEL', // by admin or tourism manager
  DELETE_ROOM_ORDER_HOTEL = 'DELETE_ROOM_ORDER_HOTEL', // by admin or tourism manager

  UPDATE_AVAILABILITY_STATUS_ROOM = 'UPDATE_AVAILABILITY_STATUS_ROOM', // by admin

  ADD_INVOICE = 'ADD_INVOICE', // by admin
  UPDATE_INVOICE = 'UPDATE_INVOICE', // by admin
  GET_INVOICE = 'GET_INVOICE', // by admin or tourism manager

  ADD_HOTEL_OFFER = 'ADD_HOTEL_OFFER', // by admin
  GET_HOTEL_OFFER = 'GET_HOTEL_OFFER', // by admin
  UPDATE_HOTEL_OFFER = 'UPDATE_HOTEL_OFFER', // by admin
  DELETE_HOTEL_OFFER = 'DELETE_HOTEL_OFFER', // by admin

  GET_HOTEL_OFFER_BY_TOURISM = 'GET_HOTEL_OFFER_BY_TOURISM', // by admin

  GET_INVOICE_STATISTICS = 'GET_INVOICE_STATISTICS', // by admin
  GET_ROOM_STATISTICS = 'GET_ROOM_STATISTICS', // by admin

  GET_PAYMENT = 'GET_PAYMENT', // by admin or tourism manager
  UPDATE_PAYMENT = 'UPDATE_PAYMENT', // by admin or tourism manager

  GET_TOUR = 'GET_TOUR', // by admin or tourism manager
  ADD_TOUR = 'ADD_TOUR', // by admin or content
  UPDATE_TOUR = 'UPDATE_TOUR', // by admin
  UPDATE_CONTENT_TOUR = 'UPDATE_CONTENT_TOUR', // by content
  DELETE_TOUR_IMAGE = 'DELETE_TOUR_IMAGE', // by admin or content
  UPDATE_PRICE_TOUR = 'UPDATE_PRICE_TOUR', // by admin or sales manager
  GET_TOUR_FEATURE = 'GET_TOUR_FEATURE', // by admin or content
  ADD_TOUR_FEATURE = 'ADD_TOUR_FEATURE', // by admin or content
  UPDATE_TOUR_FEATURE = 'UPDATE_TOUR_FEATURE', // by admin or content
  DELETE_TOUR_FEATURE = 'DELETE_TOUR_FEATURE', // by admin or content
  UPDATE_AVAILABILITY_TOUR = 'UPDATE_AVAILABILITY_TOUR', // by admin or sales manager
  GET_TOUR_PRICE = 'GET_TOUR_PRICE', // by admin
  ADD_ORDER_TOUR = 'ADD_ORDER_TOUR', // by tourism employee
  GET_ORDER_TOUR = 'GET_ORDER_TOUR', // by admin
  DELETE_ORDER_TOUR = 'DELETE_ORDER_TOUR', // by admin or tourism manager

  GET_FINANCIAL_INFO_TOUR = 'GET_FINANCIAL_INFO_TOUR',

  GET_ACTIVE_CURRENCY = 'GET_ACTIVE_CURRENCY',

  MANAGE_CUSTOMER = 'MANAGE_CUSTOMER',
  MANAGE_HOTEL = 'MANAGE_HOTEL',
  MANAGE_TOUR = 'MANAGE_TOUR',

  ADD_SLIDER = 'ADD_SLIDER',
  GET_SLIDER = 'GET_SLIDER',
  GET_SLIDER_BY_TOURISM = 'GET_SLIDER_BY_TOURISM',
  DELETE_SLIDER = 'DELETE_SLIDER',
  UPDATE_SLIDER = 'UPDATE_SLIDER',

  SEND_EMAIL_TO_HOTEL = 'SEND_EMAIL_TO_HOTEL',

  GET_SIGNUP_REQUEST = 'GET_SIGNUP_REQUEST',
  UPDATE_SIGNUP_REQUEST = 'UPDATE_SIGNUP_REQUEST',

  ADD_TRANSFER = 'ADD_TRANSFER',
  GET_TRANSFER = 'GET_TRANSFER',
  UPDATE_TRANSFER = 'UPDATE_TRANSFER',
  GET_FINANCIAL_INFO_TRANSFER = 'GET_FINANCIAL_INFO_TRANSFER',
}

@Entity('permission')
export class PermissionEntity extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('varchar', { name: 'name', length: 45 })
  name: string;

  @Column('varchar', { name: 'category', length: 128 })
  category: string;

  @Column('varchar', { name: 'description', nullable: true, length: 256 })
  description: string | null;

  @Column('varchar', { name: 'type', length: 45 })
  type: string;

  @OneToMany(
    () => RoleMapPermissionEntity,
    (roleMapPermission) => roleMapPermission.permission,
  )
  roleMapPermissions: RoleMapPermissionEntity[];
}
