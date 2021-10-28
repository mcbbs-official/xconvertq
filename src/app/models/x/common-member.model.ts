import {Injectable} from '@nestjs/common'
import {Knex} from 'knex'
import {XBaseModel} from './x-base.model'

export interface ICommonMemberSchema {
  uid: number
  email: string
  username: string
  password: string
  status: number
  regdate: number
  avatarstatus: number
}

@Injectable()
export class CommonMemberModel extends XBaseModel {
  constructor() {
    super('common_member')
  }

  get query(): ReturnType<Knex['table']> {
    return this.knex<ICommonMemberSchema>(this.tableName)
  }
}
