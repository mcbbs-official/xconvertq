import {Injectable} from '@nestjs/common'
import {IForumThreadSchema} from './forum-thread.model'
import {XBaseModel} from './x-base.model'

export interface IForumPostSchema {
  pid: number
  fid: number
  tid: number
  first: number
  author: string
  authorid: number
  subject: string
  dateline: number
  message: string
  useip: string
  port: number
  useport: string
  invisible: number
  anonymous: number
  usesig: number
  htmlon: number
  bbcodeoff: number
  smileyoff: number
  parseurloff: number
  attachment: number
  rate: number
  ratetimes: number
  status: number
  tags: string
  comment: number
  replycredit: number
  position: number
}

@Injectable()
export class ForumPostModel extends XBaseModel<IForumPostSchema> {
  constructor() {
    super('forum_post', 'pid')
  }

  public async threadFirstPost(thread: IForumThreadSchema): Promise<IForumPostSchema> {
    let table = this.query
    if (thread.posttableid) {
      table = this.knex(`${this.configService.get('X_PRE', '')}forum_post_${thread.posttableid}`)
    }
    return table.where({
      first: 1,
      tid: thread.tid,
    })
      .first()
  }

  public approvedValue(invisible: number): number | 'delete' {
    switch (invisible) {
      case 0:
        return 1
      case -3: case -2:
        return 2;
      case -5: case -1:
        return 'delete'
      default:
        return 2
    }
  }
}
