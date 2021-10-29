import {Injectable} from '@nestjs/common'
import {QInitModel} from './q-base.model'

export interface ISettingSchema {
  key: string
  value: string
  tag: string
}

@Injectable()
export class SettingModel extends QInitModel<ISettingSchema> {
  constructor() {
    super('settings', 'key')
  }

  public async init(data: ISettingSchema[]): Promise<void> {
    await this.insertMany(data)
  }

  public async set(key: string, value: string): Promise<void> {
    await this.query.insert({key, value})
      .onConflict()
      .merge(['value'])
  }
}
