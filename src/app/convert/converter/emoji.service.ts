import {Injectable} from '@nestjs/common'
import {ConfigService} from '@nestjs/config'
import {asyncStreamConsumer} from 'async-stream-consumer'
import {EmojiModel} from '../../models/q/emoji.model'
import {CommonSmileyModel, ICommonSmileySchema} from '../../models/x/common-smiley.model'
import {ForumImagetypeModel, IForumImagetypeSchema} from '../../models/x/forum-imagetype.model'
import {BaseService} from '../base.service'

@Injectable()
export class EmojiService extends BaseService {
  constructor(
    private readonly configService: ConfigService,
    private readonly forumImagetypeModel: ForumImagetypeModel,
    private readonly commonSmileyModel: CommonSmileyModel,
    private readonly emojiModel: EmojiModel,
  ) {super()}

  public async execute(): Promise<void> {
    const query = this.forumImagetypeModel.convertSmiley()

    const count = await query.clone().count({count: '*'})
    const bar = this.getBar('转换表情', count[0].count)

    const stream = query.stream({highWaterMark: this.configService.get('HighWaterMark')})

    await asyncStreamConsumer<IForumImagetypeSchema>(stream, 10, async (emojiType) => {
      const smileyStream = this.commonSmileyModel.query.where('typeid', emojiType.typeid).stream()
      await asyncStreamConsumer<ICommonSmileySchema>(smileyStream, 50, async (emoji) => {
        const code = emoji.code
          .replace(/{/, '[')
          .replace(/}/, ']')

        const qEmoji = await this.emojiModel.query.where({
          code,
          category: emojiType.directory
        })
          .first()
        const url = `emoji/${emojiType.directory}/${emoji.url}`
        if (!qEmoji) {
          await this.emojiModel.query.insert({
            category: emojiType.directory,
            code,
            order: 0,
            url,
          })
        } else {
          await this.emojiModel.query.update({
            order: 0,
            code,
            url,
          })
            .where('id', emoji.id)
        }
      })

      bar.tick()
    })
    bar.terminate()
  }
}
