import * as Logger from 'bunyan'
import {difference, isEqual, uniq} from 'lodash'
import {Command, CommandRunner, InquirerService} from 'nest-commander'
import {InjectLogger} from 'nestjs-bunyan'
import {CleanService} from './clean.service'

@Command({
  name: 'clean',
  arguments: '[tasks...]',
})
export class CleanCommand implements CommandRunner {
  @InjectLogger() private readonly logger: Logger
  private readonly tasks = {
    user: '用户',
    userWallet: '用户钱包',
    category: '分类',
    thread: '主题',
    post: '回复',
    attachment: '附件',
    emoji: '表情',
  }

  constructor(
    private readonly inquirerService: InquirerService,
    private readonly cleanService: CleanService,
  ) {}

  public async run(tasks: string[]): Promise<void> {
    tasks = uniq(tasks)
    let parts = Object.keys(this.tasks)
    if (tasks.length && !isEqual(tasks, ['all'])) {
      const left = difference(tasks, parts)
      if (left.length !== 0) throw new Error(`未知清理类型 ${left}`)
      parts = parts.filter((e) => tasks.includes(e))
    }
    const taskNames = parts.map((e) => this.tasks[e])
    const confirm = await this.inquirerService.ask('confirm', {taskNames, tasks, confirm: undefined})
    if (!confirm.confirm) return
    this.logger.info('run task %s', parts)
    for (const part of parts) {
      this.logger.info(`开始清理${this.tasks[part]}，请稍候`)
      const count = await this.cleanService[part]()
      this.logger.info(`删除${count}条数据`)
    }
  }
}
