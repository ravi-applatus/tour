import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
import * as moment from 'jalali-moment';
import * as crypto from 'crypto';

export const dateTime = () => {
  return moment().format('YYYY-MM-DD HH:mm:ss');
};

export const toQueryString = (obj, showEmptyValue = false) => {
  const parts = [];
  for (const i in obj) {
    if (obj.hasOwnProperty(i)) {
      const value = obj[i] ? encodeURIComponent(obj[i]) : '';
      if (value || showEmptyValue) {
        parts.push(`${i}=${value}`);
      }
    }
  }
  return parts.join('&');
};

export const getQueryParams = (queryString) => {
  const query = {};
  const pairs = (
    queryString[0] === '?' ? queryString.substr(1) : queryString
  ).split('&');
  for (let i = 0; i < pairs.length; i++) {
    const pair = pairs[i].split('=');
    query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
  }
  return query;
};

export const randomHash = () => {
  return crypto
    .createHash('sha256')
    .update(randomStringGenerator())
    .digest('hex');
};

export const successfulResult = (
  messages = [`It's done successfully`],
  data = {},
) => {
  return {
    success: true,
    messages,
    data,
  };
};

export const paginationResult = (
  page: number,
  limit: number,
  totalItems: number,
) => {
  return {
    itemsPerPage: +limit,
    totalItems,
    currentPage: +page,
    totalPages: Math.ceil(totalItems / +limit),
  };
};

export const underscoreToCamelCase = (value: string) => {
  return value.replace(/_./g, (m) => m[1].toUpperCase());
};

export const applyFiltersToBuilder = (builder, filters) => {
  if (filters) {
    filters.forEach((filter) => {
      const paramsValue = {};
      const fields = [];

      filter.data.forEach((data, i) => {
        let param = `${data.field}_${i + 1}`;
        paramsValue[param] = data.value;

        if (data.comparisonOperator === 'IN') {
          param = `(:...${param})`;
        } else {
          param = `:${param}`;
        }

        let alias = '';
        if (data.field.indexOf('.') === -1) {
          alias = `${builder.alias}.`;
        }

        let dbField = `${alias}${data.field}`;
        if (data.dbFunction) {
          dbField = `${data.dbFunction}(${dbField})`;
        }

        fields.push(`${dbField} ${data.comparisonOperator} ${param}`);
      });

      builder.andWhere(
        `(${fields.join(` ${filter.logicalOperator} `)})`,
        paramsValue,
      );
    });
  }

  return builder;
};

export const applySortingToBuilder = (builder, sorts) => {
  if (sorts) {
    sorts.forEach((sort) => {
      builder.addOrderBy(
        `${sort.field.indexOf('.') === -1 ? `${builder.alias}.` : ''}${
          sort.field
        }`,
        sort.dir,
      );
    });
  }
  return builder;
};

export const deleteKeys = (obj, ...keys) => {
  keys.forEach((e) => delete obj[e]);
};

export const seperateChildAndAdultList = (customers) => {
  const infants = customers.filter(
    (c) => c.age !== null && c.age !== 0 && c.age <= 5,
  );
  const childs = customers.filter(
    (c) => c.age !== null && c.age !== 0 && c.age > 5 && c.age <= 12,
  );
  const adults = customers.filter(
    (c) => c.age === 0 || c.age > 12 || c.age === null,
  );

  return { infants, childs, adults };
};

export const makeRangeDateList = (from, to, equalLast = true) => {
  const fromDate = moment(from);
  const toDate = moment(to);

  const list = [];
  if (equalLast) {
    while (fromDate.isSameOrBefore(toDate)) {
      list.push(fromDate.format('YYYY-MM-DD'));
      fromDate.add(1, 'days');
    }
  } else {
    while (fromDate.isBefore(toDate)) {
      list.push(fromDate.format('YYYY-MM-DD'));
      fromDate.add(1, 'days');
    }
  }

  return list;
};

export const stringToBool = (str) => {
  if (typeof str === 'string') {
    return str === '1' || str === 'true';
  }

  return str;
};
