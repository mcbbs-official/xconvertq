import {Injectable} from '@nestjs/common'
import {Knex} from 'knex'
import {XBaseModel} from './x-base.model'

export interface IForumForumSchema {
  fid: number
  fup: number
  type: number
  name: string
  status: number
  displayorder: number
  threads: number
  posts: number
}

@Injectable()
export class ForumForumModel extends XBaseModel<IForumForumSchema> {
  constructor() {
    super('forum_forum', 'fid')
  }

  public convertForum(): Knex.QueryBuilder<IForumForumSchema> {
    return this.query.where('status', 1).andWhere('fid', '>', 1).andWhere((q) => {
      return q.where('type', 'forum').orWhere('type', 'sub')
    })
  }
}
