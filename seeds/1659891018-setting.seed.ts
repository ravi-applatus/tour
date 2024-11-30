import { Factory, Seeder } from 'typeorm-seeding';
import { Connection } from 'typeorm';
import { SettingEntity } from '../../modules/setting/entities/setting.entity';

export default class CreateDeliveryTime implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<void> {
    const count = await connection
      .createQueryBuilder()
      .select()
      .from(SettingEntity, 'setting')
      .getCount();

    if (count === 0) {
      await connection
        .createQueryBuilder()
        .insert()
        .into(SettingEntity)
        .values({
          startWorkingTime: '08:00:00',
          endWorkingTime: '16:00:00',
          passengersInfoUpdateDeadlineHours: 4,
          bankTransferDescription: '',
        })
        .execute();
    }
  }
}
