import {Inject, Injectable} from '@nestjs/common'
import {Knex} from 'knex'
import {XMysql} from '../models.constant'

@Injectable()
export class XUserModel {
  constructor(
    @Inject(XMysql) private readonly table: Knex,
  ) {}

  get query(): ReturnType<XUserModel['table']> {
    return this.table('pre_common_member')
  }

  public async checkUsers(): Promise<boolean> {
    return !!(await this.query.where('id', '>', 1).first())
  }
}
