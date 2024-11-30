import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as moment from 'jalali-moment';
import { Repository } from 'typeorm';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { SettingEntity } from './entities/setting.entity';

@Injectable()
export class SettingService {
  constructor(
    @InjectRepository(SettingEntity)
    private settingRepository: Repository<SettingEntity>,
  ) {}

  /**
   * -------------------------------------------------------
   * GET /settings
   */
  async get(select = undefined) {
    return await this.settingRepository.findOne({ where: { id: 1 }, select });
  }

  /**
   * -------------------------------------------------------
   * PUT /settings
   */
  async update(dto: UpdateSettingDto) {
    return await this.settingRepository
      .createQueryBuilder()
      .update()
      .set(dto)
      .where({ id: 1 })
      .execute();
  }

  /**
   * -------------------------------------------------------
   */
  async isInTimeWork() {
    const { startWorkingTime, endWorkingTime } = await this.get([
      'startWorkingTime',
      'endWorkingTime',
    ]);

    // startWorkingTime = "12:00:00"
    const startWork = moment(startWorkingTime, 'HH:mm:ss');
    const endWork = moment(endWorkingTime, 'HH:mm:ss');

    return moment().isBetween(startWork, endWork);
  }
}
