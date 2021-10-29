import {toBoolean} from '@bangbang93/utils'
import {Injectable} from '@nestjs/common'
import {ConfigService} from '@nestjs/config'
import {asyncStreamConsumer} from 'async-stream-consumer'
import * as convert from 'bbcode-to-markdown'
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
import {ForumThreadModel, IForumThreadSchema} from '../../models/x/forum-thread.model'
import {BaseService} from '../base.service'

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

  constructor(
    private readonly configService: ConfigService,
    private readonly postModel: PostModel,
    private readonly forumPostModel: ForumPostModel,
    private readonly forumThreadModel: ForumThreadModel,
    private readonly forumForumModel: ForumForumModel,
    private readonly userModel: UserModel,
    private readonly threadModel: ThreadModel,
  ) {
    super()
    this.skipAnonymous = toBoolean(configService.get('SKIP_ANONYMOUS'))
    this.postIdLoader = new DataLoader<number, IPostSchema>(async (pids) => {
      const posts = await this.postModel.query.whereIn('id', pids)
      return pids.map((pid) => posts.find((post) => post.id === pid))
    })
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
    const threadQuery = this.forumThreadModel.convertThread(forumIds)
    const threadCount = await threadQuery.clone().count({count: '*'})
    const bar = this.getBar('转换回复信息', threadCount[0].count)

    const userIds = await this.userModel.getAllId()

    const usernameLoader = this.userModel.getUsernameLoader()

    const threadStream = threadQuery.clone().stream({highWaterMark: this.configService.get('HighWaterMark')})

    await asyncStreamConsumer<IForumThreadSchema>(threadStream, 50, async (thread) => {
      if (!userIds.has(thread.authorid)) {
        bar.interrupt(`用户不存在:${thread.tid}`)
        bar.tick()
        return
      }

      const postQuery = this.forumPostModel.getPostsQuery(thread).orderBy('pid', 'asc')
      const postStream = postQuery.stream({highWaterMark: this.configService.get('HighWaterMark')})
      let commentPost = 1;
      await asyncStreamConsumer<IForumPostSchema>(postStream, 50, async (post) => {
        if (!post.authorid && this.skipAnonymous) {
          return
        }
        const date = fromUnixTime(post.dateline)
        const postData: IPostSchema = {
          id: post.pid,
          user_id: post.authorid,
          thread_id: post.tid,
          is_first: post.first,
          created_at: date,
          updated_at: date,
          ip: post.useip,
          is_approved: 0,
          content: convert(post.message),
        }
        const postStatus = this.forumPostModel.approvedValue(post.invisible)
        if (postStatus === 'delete') {
          postData.deleted_at = date
        } else {
          postData.is_approved = postStatus
        }

        const result = this.findReply(post.message)
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
            commentPost++
          }
        }

        this.queue.push(postData)
        if (this.queue.length > 100) {
          await this.flush(this.queue, this.postModel)
        }
      })
      await this.threadModel.query.update({
        post_count: commentPost,
      })
        .where({
          id: thread.tid,
        })
        .limit(1)

      bar.tick()
    })
    if (this.queue.length) {
      await this.flush(this.queue, this.postModel)
    }
    bar.terminate()
    this.logger.info(`回复转换完成，耗时${formatDistanceToNow(start, {locale: zhCN})}`)
  }

  private findReply(message: string): IReply {
    let replyInfo = null
    message = message.replace(/^\[quote]([\s\S]*?)\[\/quote]/, (_, matches) => {
      if (!matches[0]) return ''
      const pid = /&pid=(\d+)&/.exec(matches[0])
      const username = /999999](.*)发表于/.exec(matches[0])
      if (pid?.[1] && username?.[1]) {
        replyInfo = {
          pid: parseInt(pid[1], 10),
          username: username[1],
        }
      }
    })
    return {
      message,
      replyInfo,
    }
  }

  private async getPost(pid: number): Promise<IPostSchema> {
    const post = this.queue.find((post) => post.id === pid)
    if (post) return post
    return this.postIdLoader.load(pid)
  }
}
