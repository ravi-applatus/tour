import { Injectable } from '@nestjs/common';
import { ConfigurationService } from '../../config/configuration.service';

@Injectable()
export class CommonService {
  constructor(private config: ConfigurationService) {}

  absoluteStaticUrl(path) {
    if (!path) return null;
    return `${this.config.app.apiBaseUrl}/static/${path}`;
  }
}
