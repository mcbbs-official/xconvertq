import {Injectable} from '@nestjs/common'
import {Knex} from 'knex'
import {ForumForumModel} from './forum-forum.model'
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

@Injectable()
export class ForumThreadModel extends XBaseModel<IForumThreadSchema> {
  constructor(
    private readonly forumForumModel: ForumForumModel,
  ) {
    super('forum_thread', 'tid')
  }

  public async convertThread(): Promise<Knex.QueryBuilder<IForumThreadSchema>> {
    const forumIds = await this.forumForumModel.query.distinct<number>('fid')
    return this.query.where('special', 0)
      .andWhere('displayorder', 'in', [0, -1, -2, -3])
      .andWhere('fid', 'in', forumIds)
      .orderBy('tid', 'asc')
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
