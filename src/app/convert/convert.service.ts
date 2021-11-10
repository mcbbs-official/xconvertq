import * as Logger from 'bunyan'
import {difference, isEqual, uniq} from 'lodash'
import {Command, CommandRunner} from 'nest-commander'
import {InjectLogger} from 'nestjs-bunyan'
import {BaseService} from './base.service'
import {AttachmentService} from './converter/attachment.service'
import {CategoryService} from './converter/category.service'
import {EmojiService} from './converter/emoji.service'
import {PostService} from './converter/post.service'
import {SettingService} from './converter/setting.service'
import {ThreadService} from './converter/thread.service'
import {UserService} from './converter/user.service'

@Command({
  name: 'convert',
  description: '转换',
  arguments: '<tasks...>',
})
export class ConvertService implements CommandRunner {
  @InjectLogger() private readonly logger: Logger
  public readonly parts: Record<string, BaseService>

  constructor(
    private readonly userService: UserService,
    private readonly categoryService: CategoryService,
    private readonly attachmentService: AttachmentService,
    private readonly emojiService: EmojiService,
    private readonly threadService: ThreadService,
    private readonly postService: PostService,
    private readonly settingService: SettingService,
  ) {
    this.parts = {
      user: this.userService,
      category: this.categoryService,
      attachment: this.attachmentService,
      emoji: this.emojiService,
      thread: this.threadService,
      post: this.postService,
      setting: this.settingService,
    }
  }

  public async run(part: string[]): Promise<void> {
    part = uniq(part)
    let parts = Object.keys(this.parts)
    if (part.length && !isEqual(part, ['all'])) {
      const left = difference(part, parts)
      if (left.length !== 0) throw new Error(`未知转换类型 ${left}`)
      parts = parts.filter((e) => part.includes(e))
    }
    for (const part of parts) {
      const service = this.parts[part]
      await service.execute()
    }
    this.logger.info('全部转换完成')
  }
}
