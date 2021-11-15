import {Injectable, OnModuleInit} from '@nestjs/common'
import * as DataLoader from 'dataloader'
import {AttachmentModel, IAttachmentSchema} from '../models/q/attachment.model'
import {CommonSmileyModel, ICommonSmileySchema} from '../models/x/common-smiley.model'
import {ForumImagetypeModel, IForumImagetypeSchema} from '../models/x/forum-imagetype.model'

@Injectable()
export class MessageService implements OnModuleInit {
  private readonly attachmentIdLoader: DataLoader<number, IAttachmentSchema>

  private readonly emojiType = new Map<number, string>()
  private readonly emoji: Array<{search: string; replace: string}> = []

  constructor(
    private readonly forumImagetypeModel: ForumImagetypeModel,
    private readonly commonSmileyModel: CommonSmileyModel,
    attachmentModel: AttachmentModel,
  ) {
    this.attachmentIdLoader = attachmentModel.getPkLoader()
  }

  public async onModuleInit(): Promise<void> {
    const imageType: IForumImagetypeSchema[] = await this.forumImagetypeModel.query.select()
    for (const type of imageType) {
      this.emojiType.set(type.typeid, type.directory)
    }
    const smiles: ICommonSmileySchema[] = await this.commonSmileyModel.query.select()
    for (const smile of smiles) {
      this.emoji.push({
        search: this.escapeHtml(smile.code),
        replace: smile.code.replace('{', '[').replace('}', ']'),
      })
    }
  }

  public async processMessage(message: string): Promise<string> {
    message = await this.replaceAttachment(message)
    message = await this.replaceEmoji(message)
    return message
  }

  private async replaceAttachment(message: string): Promise<string> {
    const matches = message.match(/\[attach\](\d+)\[\/attach\]/iug)
    if (matches) {
      const ids = matches.slice(1).map((e) => parseInt(e, 10))
      const attachments = await this.attachmentIdLoader.loadMany(ids)
      for (const id of ids) {
        const attachment = attachments.find((att) => att instanceof Error ? false : att.id === id) as IAttachmentSchema
        if (!attachment || attachment.type !== 1) {
          message.replace(`[attach]${id}[/attach]`, '')
        } else {
          message = message.replace(`[attach]${attachment.id}[/attach]`,
            `[img alt="${attachment.id}" src="http://discuz" title="${attachment.id}" width="" height=""][/img]`)
        }
      }
    }
    return message
  }

  private async replaceEmoji(message: string): Promise<string> {
    for (const emoji of this.emoji) {
      message = message.replace(emoji.search, emoji.replace)
    }
    return message
  }

  private escapeHtml(unsafe: string): string {
    return unsafe
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll('\'', '&#039;')
  }
}
