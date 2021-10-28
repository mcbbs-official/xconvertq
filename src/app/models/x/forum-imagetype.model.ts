import {Injectable} from '@nestjs/common'
import {Knex} from 'knex'
import {XBaseModel} from './x-base.model'

export interface IForumImagetypeSchema {
  typeid: number
  available: number
  name: string
  type: string
  displayorder: number
  directory: string
}

@Injectable()
export class ForumImagetypeModel extends XBaseModel<IForumImagetypeSchema> {
  constructor() {
    super('forum_imagetype', 'typeid')
  }

  public convertSmiley(): Knex.QueryBuilder<IForumImagetypeSchema> {
    return this.query.where('type', 'smiley')
  }
}
