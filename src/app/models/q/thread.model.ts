import {Injectable} from '@nestjs/common'
import {QInitModel} from './q-base.model'

export interface IThreadSchema {
  id: number
  user_id: number
  last_posted_user_id?: number
  category_id: number
  type: number
  title: string
  price?: number
  attachment_price?: number
  free_words?: number
  post_count: number
  view_count: number
  rewarded_count?: number
  paid_count?: number
  address: string
  location: string
  longitude: number
  latitude: number
  is_approved: number
  posted_at: Date
  created_at: Date
  updated_at: Date
  deleted_at?: Date
}

@Injectable()
export class ThreadModel extends QInitModel<IThreadSchema> {
  constructor() {
    super('threads', 'id')
  }

  public async init(data: IThreadSchema[]): Promise<void> {
    await this.insertMany(data)
  }
}
