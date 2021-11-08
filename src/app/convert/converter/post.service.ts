import {toBoolean} from '@bangbang93/utils'
import {Injectable} from '@nestjs/common'
import {ConfigService} from '@nestjs/config'
import {asyncStreamConsumer} from 'async-stream-consumer'
import * as Bluebird from 'bluebird'
import * as Logger from 'bunyan'
import * as DataLoader from 'dataloader'
import {formatDistanceToNow, fromUnixTime} from 'date-fns'
import {zhCN} from 'date-fns/locale'
import {InjectLogger} from 'nestjs-bunyan'
import {IPostSchema, PostModel} from '../../models/q/post.model'
import {ThreadModel} from '../../models/q/thread.model'
import {UserModel} from '../../models/q/user.model'
import {ForumForumModel} from '../../models/x/forum-forum.model'
import {ForumPostModel, IForumPostSchema} from '../../models/x/forum-post.model'
import {ForumThreadModel} from '../../models/x/forum-thread.model'
import {BaseService} from '../base.service'
import ms = require('ms')
import Piscina = require('piscina')


interface IReply {
  message: string
  replyInfo: {
    pid: number
    username: string
  }
}

@Injectable()
export class PostService extends BaseService {
  @InjectLogger() private readonly logger: Logger

  private readonly skipAnonymous: boolean

  private readonly queue: IPostSchema[] = []
  private readonly postIdLoader: DataLoader<number, IPostSchema>

  private readonly piscina: Piscina

  constructor(
    private readonly postModel: PostModel,
    private readonly forumPostModel: ForumPostModel,
    private readonly forumThreadModel: ForumThreadModel,
    private readonly forumForumModel: ForumForumModel,
    private readonly userModel: UserModel,
    private readonly threadModel: ThreadModel,
    configService: ConfigService,
  ) {
    super()
    this.skipAnonymous = toBoolean(configService.get('SKIP_ANONYMOUS'))
    this.postIdLoader = new DataLoader<number, IPostSchema>(async (pids) => {
      const posts = await this.postModel.query.whereIn('id', pids)
      return pids.map((pid) => posts.find((post) => post.id === pid))
    })
    this.piscina = new Piscina({
      filename: require.resolve('../../../worker'),
      idleTimeout: ms('1h'),
      maxThreads: parseInt(configService.get('MAX_THREAD', '0'), 10) || null,
      workerData: {
        mode: configService.get('CONVERT_MODE', 'html')
      }
    })
  }

  public onModuleInit() {
    super.onModuleInit()
    if (this.batchSize > 10) {
      this.batchSize = Math.ceil(this.batchSize / 10)
    }
  }

  public async execute(): Promise<void> {
    const check = await this.postModel.check()
    if (check) {
      this.logger.error('Q帖子表中有数据，请先删除再执行命令')
      return
    }

    const start = new Date()

    const forumIdsQuery = await this.forumForumModel.query.distinct('fid')
    const forumIds = forumIdsQuery.map((e) => e.fid)
    const postQuery = this.forumPostModel.convertPost(forumIds)
    this.logger.info('统计总数')
    // const postCount = await postQuery.clone().count({count: 'pid'})
    const bar = this.getBar('转换回复信息', 17190566)

    bar.interrupt('构建用户缓存')
    const userIds = await this.userModel.getAllId()

    const usernameLoader = this.userModel.getUsernameLoader()

    const postStream = postQuery.clone().stream({highWaterMark: this.configService.get('HighWaterMark')})

    const threadCache = this.forumThreadModel.getPostConvertCache()
    const threadCounter = new Map<number, number>()

    await asyncStreamConsumer<IForumPostSchema>(postStream, this.concurrent, async (post) => {
      if (!post.authorid && this.skipAnonymous) {
        return
      }
      if (!userIds.has(post.authorid)) {
        bar.interrupt(`用户不存在: pid ${post.pid}`)
        return
      }

      const thread = await threadCache.load(post.tid)
      if (!thread) {
        bar.interrupt(`主题帖不存在: pid ${post.tid}`)
        bar.tick()
        return
      }
      if (!userIds.has(thread.authorid)) {
        bar.interrupt(`用户不存在: tid ${thread.tid}`)
        bar.tick()
        return
      }

      const date = fromUnixTime(post.dateline)

      const result: IReply = await this.piscina.run(post.message)
      const postData: IPostSchema = {
        id: post.pid,
        user_id: post.authorid,
        thread_id: post.tid,
        is_first: post.first,
        created_at: date,
        updated_at: date,
        ip: post.useip,
        is_approved: 0,
        content: result.message,
      }
      const postStatus = this.forumPostModel.approvedValue(post.invisible)
      if (postStatus === 'delete') {
        postData.deleted_at = date
      } else {
        postData.is_approved = postStatus
      }

      if (result.replyInfo) {
        const replyUser = await usernameLoader.load(result.replyInfo.username)
        if (replyUser) {
          const replyPost = await this.getPost(result.replyInfo.pid)
          if (replyPost) {
            postData.reply_post_id = replyPost.is_comment ? replyPost.reply_post_id : result.replyInfo.pid
          }
          postData.reply_user_id = replyUser.id
          postData.is_comment = 1
        }
      } else {
        if (!postData.deleted_at) {
          const count = threadCounter.get(postData.thread_id) ?? 0
          threadCounter.set(postData.thread_id, count + 1)
        }
      }

      this.queue.push(postData)
      if (this.queue.length > this.batchSize) {
        await this.flush(this.queue, this.postModel)
      }

      bar.tick()
    })
    if (this.queue.length) {
      await this.flush(this.queue, this.postModel)
    }
    bar.terminate()

    const countBar = this.getBar('更新帖子统计信息', threadCounter.size)
    await Bluebird.map(threadCounter.entries(), async ([tid, counter]) => {
      await this.threadModel.query.update({
        post_count: counter,
      })
        .where({
          id: tid,
        })
        .limit(1)
      countBar.tick()
    }, {
      concurrency: this.concurrent,
    })

    this.logger.info(`回复转换完成，耗时${formatDistanceToNow(start, {locale: zhCN})}`)
  }

  private async getPost(pid: number): Promise<IPostSchema> {
    const post = this.queue.find((post) => post.id === pid)
    if (post) return post
    return this.postIdLoader.load(pid)
  }
}
