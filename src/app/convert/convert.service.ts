import {Injectable} from '@nestjs/common'
import {AttachmentService} from './converter/attachment.service'
import {BaseService} from './base.service'
import {CategoryService} from './converter/category.service'
import {EmojiService} from './converter/emoji.service'
import {ThreadService} from './converter/thread.service'
import {UserService} from './converter/user.service'

@Injectable()
export class ConvertService {
  public readonly parts: Record<string, BaseService>

  constructor(
    private readonly userService: UserService,
    private readonly categoryService: CategoryService,
    private readonly attachmentService: AttachmentService,
    private readonly emojiService: EmojiService,
    private readonly threadService: ThreadService,
  ) {
    this.parts = {
      user: this.userService,
      category: this.categoryService,
      attachment: this.attachmentService,
      emoji: this.emojiService,
      thread: this.threadService,
    }
  }

  public async run(part: string[]): Promise<void> {
    await this.threadService.execute()
  }
}
