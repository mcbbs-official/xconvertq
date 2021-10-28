import {Injectable} from '@nestjs/common'
import {XBaseModel} from './x-base.model'

export interface IForumForumfieldSchema {
  fid: number
  description: string
  icon: string
}

@Injectable()
export class ForumForumfieldModel extends XBaseModel<IForumForumfieldSchema> {
  constructor() {
    super('forum_forumfield', 'fid')
  }
}
