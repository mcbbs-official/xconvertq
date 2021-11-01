import {Injectable} from '@nestjs/common'
import * as DataLoader from 'dataloader'
import {Knex} from 'knex'
import {pick} from 'lodash'
import * as QuickLRU from 'quick-lru'
import {XBaseModel} from './x-base.model'

export interface IForumThreadSchema {
  tid: number
  fid: number
  posttableid: number
  typeid: number
  sortid: number
  readperm: number
  price: number
  author: string
  authorid: number
  subject: string
  dateline: number
  lastpost: number
  lastposter: string
  views: number
  replies: number
  displayorder: number
  highlight: number
  digest: number
  rate: number
  special: number
  attachment: number
  moderated: number
  closed: number
  stickreply: number
  recommends: number
  recommend_add: number
  recommend_sub: number
  heats: number
  status: number
  isgroup: number
  favtimes: number
  sharetimes: number
  stamp: number
  icon: number
  pushedaid: number
  cover: number
  replycredit: number
  relatebytag: string
  maxposition: number
  bgcolor: string
  comments: number
  hidden: number
}

export type ThreadCache = Pick<IForumThreadSchema, 'tid' | 'fid' | 'displayorder' | 'special' | 'authorid'>

@Injectable()
export class ForumThreadModel extends XBaseModel<IForumThreadSchema> {
  constructor(
  ) {
    super('forum_thread', 'tid')
  }

  public convertThread(fids: number[]): Knex.QueryBuilder<IForumThreadSchema> {
    return this.query.where('special', 0)
      .andWhere('displayorder', 'in', [0, -1, -2, -3])
      .andWhere('fid', 'in', fids)
      .orderBy('tid', 'asc')
  }

  public getPostConvertCache(): DataLoader<number, ThreadCache> {
    return new DataLoader<number, ThreadCache>(async (ids) => {
      const threads: IForumThreadSchema[] = await this.query.whereIn('tid', ids)
      return ids.map((id) => {
        const thread = threads.find((thread) => thread.tid === id)
        if (!thread) return null
        return pick(thread, 'tid', 'fid', 'displayorder', 'special', 'authorid')
      })
    }, {
      cacheMap: new QuickLRU({maxSize: 1e6})
    })
  }

  public approvedStatus(displayorder: number): number | 'delete' {
    switch (displayorder) {
      case 0:
        return 1
      case -1:
        return 'delete'
      case -2: case -3:
        return 2
      default:
        return 0
    }
  }
}
