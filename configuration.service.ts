import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
dotenv.config();

type App = {
  nodeEnv: string;
  name: string;
  workingDirectory: string;
  port: number;
  panelBaseUrl: string;
  apiBaseUrl: string;
};
type Auth = {
  secret: string;
  expires: string;
  expiresLifetime: string;
};
type Mail = {
  port: number;
  host: string;
  user: string;
  password: string;
  defaultEmail: string;
  defaultName: string;
  ignoreTLS: boolean;
  secure: boolean;
  requireTLS: boolean;
  salesEmail: string;
};
type Redis = {
  port: number;
  host: string;
};

type Gateway = {
  ragaexMode: string; // live or sandbox
  ragaexMerchantId: string;
};

@Injectable()
export class ConfigurationService {
  public app: App;
  public auth: Auth;
  public mail: Mail;
  public gateway: Gateway;

  public redis: Redis;

  constructor() {
    this.getEnv();
  }

  async getEnv() {
    const env = process.env;

    this.app = {
      nodeEnv: env.NODE_ENV,
      name: env.APP_NAME,
      workingDirectory: env.PWD || process.cwd(),
      port: parseInt(env.APP_PORT || env.PORT, 10) || 3000,
      panelBaseUrl: env.PANEL_BASE_URL,
      apiBaseUrl: env.API_BASE_URL,
    };

    this.auth = {
      secret: env.AUTH_JWT_SECRET,
      expires: env.AUTH_JWT_TOKEN_EXPIRES_IN,
      expiresLifetime: env.AUTH_JWT_TOKEN_LIFETIME_EXPIRES_IN,
    };

    this.mail = {
      port: parseInt(env.MAIL_PORT, 10),
      host: env.MAIL_HOST,
      user: env.MAIL_USER,
      password: env.MAIL_PASSWORD,
      defaultEmail: env.MAIL_DEFAULT_EMAIL,
      salesEmail: env.MAIL_SALES_EMAIL,
      defaultName: env.MAIL_DEFAULT_NAME,
      ignoreTLS: env.MAIL_IGNORE_TLS === 'true',
      secure: env.MAIL_SECURE === 'true',
      requireTLS: env.MAIL_REQUIRE_TLS === 'true',
    };

    this.redis = {
      port: parseInt(env.REDIS_PORT, 10),
      host: env.REDIS_HOST,
    };

    this.gateway = {
      ragaexMode: env.RAGAEX_MODE,
      ragaexMerchantId: env.RAGAEX_MERCHANT_ID,
    };
  }
}
