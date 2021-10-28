import {Injectable} from '@nestjs/common'
import {QInitModel} from './q-base.model'

export interface IPostSchema {
  id: number
  user_id: number
  thread_id: number
  reply_post_id?: number
  reply_user_id?: number
  comment_post_id?: number
  comment_user_id?: number
  content: string
  ip: string
  port?: number
  reply_count?: number
  like_content?: number
  created_at: Date
  updated_at: Date
  deleted_at?: Date
  is_first: number
  is_comment?: number
  is_approved?: number
}

@Injectable()
export class PostModel extends QInitModel<IPostSchema> {
  constructor() {
    super('posts')
  }

  public async init(data: IPostSchema[]): Promise<void> {
    await this.insertMany(data)
  }
}
