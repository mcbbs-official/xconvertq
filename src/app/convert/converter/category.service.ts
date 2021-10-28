import {Injectable} from '@nestjs/common'
import {asyncStreamConsumer} from 'async-stream-consumer'
import * as Logger from 'bunyan'
import {InjectLogger} from 'nestjs-bunyan'
import {CategoryModel, ICategorySchema} from '../../models/q/category.model'
import {ForumForumModel, IForumForumSchema} from '../../models/x/forum-forum.model'
import {ForumForumfieldModel} from '../../models/x/forum-forumfield.model'
import {BaseService} from '../base.service'

@Injectable()
export class CategoryService extends BaseService {
  @InjectLogger() private readonly logger: Logger

  constructor(
    private readonly categoryModel: CategoryModel,
    private readonly forumForumModel: ForumForumModel,
    private readonly forumForumfieldModel: ForumForumfieldModel,
  ) {
    super()
  }

  public async execute(): Promise<void> {
    const checkCategory = await this.categoryModel.checkCategory()
    if (checkCategory) {
      this.logger.error('Q分类表中有出默认分类外的数据，请先删除再执行命令')
      return
    }

    const count = await this.forumForumModel.convertForum().clone().count({count: '*'})
    const bar = this.getBar('转换板块信息', count[0].count)

    const query = this.forumForumModel.convertForum().stream()

    const queue: ICategorySchema[] = []

    const date = new Date()

    await asyncStreamConsumer<IForumForumSchema>(query, 50, async (forum) => {
      const forumField = await this.forumForumfieldModel.getByPk(forum.fid)

      const category: ICategorySchema = {
        id: forum.fid,
        name: forum.name,
        description: forumField.description,
        icon: forumField.icon,
        sort: forum.displayorder,
        moderators: '',
        property: 0,
        thread_count: forum.threads,
        created_at: date,
        updated_at: date,
      }
      queue.push(category)
      if (queue.length > 1000) {
        await this.flush(queue, this.categoryModel)
      }
      bar.tick()
    })
    await this.flush(queue, this.categoryModel)
    bar.terminate()
  }
}
