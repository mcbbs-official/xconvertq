import {Injectable} from '@nestjs/common'
import * as Logger from 'bunyan'
import {formatDistanceToNow} from 'date-fns'
import {zhCN} from 'date-fns/locale'
import {InjectLogger} from 'nestjs-bunyan'
import {PostModel} from '../../models/q/post.model'
import {SettingModel} from '../../models/q/setting.model'
import {ThreadModel} from '../../models/q/thread.model'
import {UserModel} from '../../models/q/user.model'
import {BaseService} from '../base.service'

@Injectable()
export class SettingService extends BaseService {
  @InjectLogger() private readonly logger: Logger

  constructor(
    private readonly settingModel: SettingModel,
    private readonly threadModel: ThreadModel,
    private readonly userModel: UserModel,
    private readonly postModel: PostModel,
  ) {
    super()
  }

  public async execute(): Promise<void> {

    const start = new Date()
    const bar = this.getBar('更新统计信息', 3)

    const threadCount = await this.threadModel.query.count({count: '*'})
    await this.settingModel.set('thread_count', threadCount[0].count)
    bar.tick()

    const userCount = await this.userModel.query.count({count: '*'})
    await this.settingModel.set('user_count', userCount[0].count)
    bar.tick()

    const postCount = await this.postModel.query.count({count: '*'})
    await this.settingModel.set('post_count', postCount[0].count)
    bar.tick()
    bar.terminate()
    this.logger.info(`统计转换完成，耗时${formatDistanceToNow(start, {locale: zhCN})}`)
  }
}
