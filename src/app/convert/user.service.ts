import {Injectable} from '@nestjs/common'
import * as Logger from 'bunyan'
import {InjectLogger} from 'nestjs-bunyan'
import * as ProgressBar from 'progress'
import {XUserModel} from '../models/x/x-user.model'

@Injectable()
export class UserService {
  @InjectLogger() logger: Logger

  constructor(
    private readonly xUserModel: XUserModel,
  ) {}

  public async execute() {
    const checkUser = await this.xUserModel.checkUsers()
    if (checkUser) {
      this.logger.error('Q用户表有除user_id = 1 之外的数据无法继续执行用户转换，请先删除再执行命令')
      return
    }

    const count = await this.xUserModel.query.count({count: '*'})

    const bar = new ProgressBar('[user] [:bar] :rate/pps :percent :etas', {
      total: count.count,
    })
  }
}
