import {
  BullModuleOptions,
  SharedBullConfigurationFactory,
} from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { ConfigurationService } from 'src/config/configuration.service';

@Injectable()
export class BullConfigService implements SharedBullConfigurationFactory {
  constructor(private config: ConfigurationService) {}

  createSharedConfiguration(): BullModuleOptions {
    return {
      redis: {
        host: this.config.redis.host,
        port: this.config.redis.port,
      },
    };
  }
}
