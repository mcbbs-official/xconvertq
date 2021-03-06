import {toBoolean} from '@bangbang93/utils'
import {Injectable} from '@nestjs/common'
import {ConfigService} from '@nestjs/config'
import {asyncStreamConsumer} from 'async-stream-consumer'
import * as Logger from 'bunyan'
import {formatDistanceToNow, fromUnixTime} from 'date-fns'
import {zhCN} from 'date-fns/locale'
import {InjectLogger} from 'nestjs-bunyan'
import {IPostSchema, PostModel} from '../../models/q/post.model'
import {IThreadSchema, ThreadModel} from '../../models/q/thread.model'
import {UserModel} from '../../models/q/user.model'
import {ForumForumModel} from '../../models/x/forum-forum.model'
import {ForumPostModel} from '../../models/x/forum-post.model'
import {ForumThreadModel, IForumThreadSchema} from '../../models/x/forum-thread.model'
import {BaseService} from '../base.service'

@Injectable()
export class ThreadService extends BaseService {
  @InjectLogger() private readonly logger: Logger

  private readonly skipAnonymous: boolean

  private threadType = 1

  constructor(
    private readonly threadModel: ThreadModel,
    private readonly forumThreadModel: ForumThreadModel,
    private readonly userModel: UserModel,
    private readonly forumPostModel: ForumPostModel,
    private readonly postModel: PostModel,
    private readonly forumForumModel: ForumForumModel,
    configService: ConfigService,
  ) {
    super()
    this.skipAnonymous = toBoolean(configService.get('SKIP_ANONYMOUS'))
  }

  public onModuleInit() {
    super.onModuleInit()
    if (this.batchSize > 10) {
      this.batchSize = Math.round(this.batchSize / 10)
    }
    if (this.configService.get('CONVERT_MODE') === 'markdown') {
      this.threadType = 99
    }
  }

  public async execute(): Promise<void> {
    const threadCheck = await this.threadModel.check()
    if (threadCheck) {
      this.logger.error('Q主题表中有数据，请先删除再执行命令')
      return
    }

    const start = new Date()

    const forumIdsQuery = await this.forumForumModel.query.distinct('fid')
    const forumIds = forumIdsQuery.map((e) => e.fid)

    const count = await this.forumThreadModel.convertThread(forumIds).count({count: 'tid'})
    const bar = this.getBar('转换主题信息', count[0].count)

    const stream = this.forumThreadModel.convertThread(forumIds).stream({
      highWaterMark: this.configService.get('HighWaterMark'),
    })

    bar.interrupt('构建用户缓存')
    const userIds = await this.userModel.getAllId()

    const threadQueue: IThreadSchema[] = []
    const postQueue: IPostSchema[] = []
    await asyncStreamConsumer<IForumThreadSchema>(stream, this.concurrent, async (thread) => {
      if (!thread.authorid) {
        if (this.skipAnonymous) {
          bar.interrupt(`跳过匿名贴: tid=${thread.tid}`)
          bar.tick()
          return
        } else {
          thread.authorid = 1
        }
      }

      if (!userIds.has(thread.authorid)) {
        bar.interrupt(`用户不存在: tid=${thread.tid} uid=${thread.authorid}`)
        bar.tick()
        return
      }
      const firstPost = await this.forumPostModel.threadFirstPost(thread)
      if (!firstPost) {
        bar.interrupt(`跳过无楼主贴: tid=${thread.tid}`)
        bar.tick()
        return
      }
      if (!firstPost.authorid) {
        if (this.skipAnonymous) {
          bar.interrupt(`跳过匿名贴2: tid=${thread.tid}`)
          bar.tick()
          return
        } else {
          firstPost.authorid = 1
        }
      }
      const date = fromUnixTime(thread.dateline)
      const threadData: IThreadSchema = {
        id: thread.tid,
        user_id: thread.authorid,
        category_id: thread.fid,
        type: this.threadType,
        title: thread.subject,
        post_count: thread.replies + 1,
        view_count: thread.views,
        address: '',
        location: '',
        longitude: 0,
        latitude: 0,
        created_at: date,
        updated_at: date,
        posted_at: date,
        is_approved: 0,
      }
      const status = this.forumThreadModel.approvedStatus(thread.displayorder)
      if (status === 'delete') {
        threadData.deleted_at = date
        threadData.is_approved = 0
      } else {
        threadData.is_approved = status
      }

      const postStatus = this.forumPostModel.approvedValue(firstPost.invisible)
      const content = await this.piscina.run(firstPost.message, {name: 'convertMessage'})
      const postData: IPostSchema = {
        id: firstPost.pid,
        user_id: firstPost.authorid,
        thread_id: firstPost.tid,
        is_first: firstPost.first,
        created_at: date,
        updated_at: fromUnixTime(thread.lastpost),
        content,
        ip: firstPost.useip,
      }
      if (postStatus === 'delete') {
        postData.deleted_at = date
        postData.is_approved = 0
      } else {
        postData.is_approved = postStatus
      }

      threadQueue.push(threadData)
      postQueue.push(postData)
      if (threadQueue.length > this.batchSize) {
        await this.flush(threadQueue, this.threadModel)
      }
      if (postQueue.length > this.batchSize) {
        await this.flush(postQueue, this.postModel)
      }
      bar.tick()
    })
    if (threadQueue.length) {
      await this.flush(threadQueue, this.threadModel)
    }
    if (postQueue.length) {
      await this.flush(postQueue, this.postModel)
    }
    bar.terminate()
    this.logger.info(`帖子转换完成，耗时${formatDistanceToNow(start, {locale: zhCN})}`)
  }
}
