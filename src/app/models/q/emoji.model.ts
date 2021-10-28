import {Injectable} from '@nestjs/common'
import {QBaseModel} from './q-base.model'

export interface IEmojiSchema {
  id: number
  category: string
  url: string
  code: string
  order: number
  created_at: Date
  updated_at: Date
}

@Injectable()
export class EmojiModel extends QBaseModel<IEmojiSchema> {
  constructor() {
    super('emoji', 'id')
  }
}
