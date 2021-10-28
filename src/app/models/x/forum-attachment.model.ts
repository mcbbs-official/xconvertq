import {Injectable} from '@nestjs/common'
import {Knex} from 'knex'
import {XBaseModel} from './x-base.model'

export interface IForumAttachmentSchema {
  aid: number
  tid: number
  pid: number
  downloads: number
  uid: number
  tableid: number
}

export interface IRealAttachmentSchema {
  aid: number
  tid: number
  pid: number
  uid: number
  dateline: number
  filename: string
  filesize: number
  attachment: string
  remote: number
  description: string
  readPerm: number
  price: number
  isimage: number
  width: number
  thumb: number
  picid: number
}

@Injectable()
export class ForumAttachmentModel extends XBaseModel<IForumAttachmentSchema> {
  constructor() {
    super('forum_attachment', 'aid')
  }

  public convertAttachment(): Knex.QueryBuilder<IForumAttachmentSchema> {
    return this.query.where('tableid', '<=', 10)
  }

  public async getAttachmentInfo(attachmentIndex: IForumAttachmentSchema): Promise<IRealAttachmentSchema> {
    const table = `${this.configService.get('X_PRE')}forum_attachment_${attachmentIndex.tableid}`
    return this.knex<IRealAttachmentSchema>(table).where({aid: attachmentIndex.aid}).first()
  }
}
