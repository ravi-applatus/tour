import axios from 'axios';
import * as https from 'https';
import { Injectable } from '@nestjs/common';
import { ConfigurationService } from '../../config/configuration.service';

@Injectable()
export class RagaexService {
  private axios;

  constructor(private config: ConfigurationService) {
    this.axios = axios.create({
      baseURL:
        config.gateway.ragaexMode === 'sandbox'
          ? 'https://api.ragaex.co'
          : 'https://api.ragaex.co',

      // TODO:
      ...(config.gateway.ragaexMode === 'sandbox' && {
        httpsAgent: new https.Agent({
          rejectUnauthorized: false,
        }),
      }),
    });
  }

  /**
   * @returns {token, redirectUrl}
   */
  async pay(amount, unitCode, callbackUrl, description = '') {
    const { data } = await this.axios.post('/terminals/pay', {
      merchantId: this.config.gateway.ragaexMerchantId,
      amount,
      unitCode,
      callbackUrl,
      description,
    });

    return data.data;
  }

  async verify(amount, unitCode, authority) {
    const { data } = await this.axios.post('/terminals/verify', {
      merchantId: this.config.gateway.ragaexMerchantId,
      amount,
      unitCode,
      authority,
    });

    return data.data;
  }

  async exchanges() {
    try {
      const { data } = await this.axios.get('/payments/exchanges/terminal', {
        params: {
          merchant_id: this.config.gateway.ragaexMerchantId,
        },
      });

      return data.data;
    } catch (e) {
      console.log(e?.response?.data);
      throw e;
    }
  }
}
