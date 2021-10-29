import {Injectable} from '@nestjs/common'
import {asyncStreamConsumer} from 'async-stream-consumer'
import * as Logger from 'bunyan'
import {formatDistanceToNow} from 'date-fns'
import {zhCN} from 'date-fns/locale'
import {InjectLogger} from 'nestjs-bunyan'
import {basename, dirname} from 'path'
import {v4} from 'uuid'
import {AttachmentModel, IAttachmentSchema} from '../../models/q/attachment.model'
import {ForumAttachmentModel, IForumAttachmentSchema} from '../../models/x/forum-attachment.model'
import {BaseService} from '../base.service'

@Injectable()
export class AttachmentService extends BaseService {
  @InjectLogger() private readonly logger: Logger

  constructor(
    private readonly attachmentModel: AttachmentModel,
    private readonly forumAttachmentModel: ForumAttachmentModel,
  ) {super()}

  public async execute(): Promise<void> {
    const attachmentStatus = await this.attachmentModel.check()
    if (attachmentStatus) {
      this.logger.error('Q附件表中有数据，请先删除再执行命令')
      return
    }
    const start = new Date()

    const query = this.forumAttachmentModel.convertAttachment()
    const count = await query.clone().count({count: '*'})

    const bar = this.getBar('转换附件', count[0].count)

    const queue: IAttachmentSchema[] = []

    const date = new Date()

    const stream = query.stream({highWaterMark: this.configService.get('HighWaterMark')})
    await asyncStreamConsumer<IForumAttachmentSchema>(stream, this.concurrent, async (attach) => {
      const attachmentInfo = await this.forumAttachmentModel.getAttachmentInfo(attach)
      if (!attachmentInfo) {
        bar.tick()
        return
      }
      const file = attachmentInfo.attachment
      queue.push({
        id: attachmentInfo.aid,
        uuid: v4(),
        user_id: attachmentInfo.uid,
        type_id: attachmentInfo.pid,
        order: 0,
        type: attachmentInfo.isimage ? 1: 0,
        is_remote: attachmentInfo.remote,
        is_approved: 1,
        attachment: basename(file),
        file_path: attachmentInfo.remote ? file : `public/attachments/${dirname(file)}`,
        file_name: attachmentInfo.filename,
        file_size: attachmentInfo.filesize,
        file_type: '',
        ip: '',
        created_at: date,
        updated_at: date,
      })
      if (queue.length > this.batchSize) {
        await this.flush(queue, this.attachmentModel)
      }
      bar.tick()
    })
    await this.flush(queue, this.attachmentModel)
    bar.terminate()
    this.logger.info(`附件转换完成，耗时${formatDistanceToNow(start, {locale: zhCN})}`)
  }
}
