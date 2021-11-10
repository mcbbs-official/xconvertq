import {Injectable} from '@nestjs/common'
import {AttachmentModel} from '../models/q/attachment.model'
import {CategoryModel} from '../models/q/category.model'
import {EmojiModel} from '../models/q/emoji.model'
import {GroupPermissionModel} from '../models/q/group-permission.model'
import {PostModel} from '../models/q/post.model'
import {ThreadModel} from '../models/q/thread.model'
import {UserWalletModel} from '../models/q/user-wallet.model'
import {UserModel} from '../models/q/user.model'
import {ForumImagetypeModel} from '../models/x/forum-imagetype.model'

@Injectable()
export class CleanService {
  constructor(
    private readonly userModel: UserModel,
    private readonly userWalletModel: UserWalletModel,
    private readonly categoryModel: CategoryModel,
    private readonly groupPermissionModel: GroupPermissionModel,
    private readonly postModel: PostModel,
    private readonly threadModel: ThreadModel,
    private readonly attachmentModel: AttachmentModel,
    private readonly forumImagetypeModel: ForumImagetypeModel,
    private readonly emojiModel: EmojiModel,
  ) {}

  public async user(): Promise<number> {
    return this.userModel.query.where('id', '>', 1).delete()
  }

  public async userWallet(): Promise<number> {
    return this.userWalletModel.query.where('user_id', '>', 1).delete()
  }

  public async readonly category(): Promise<number> {
    const categories = await this.categoryModel.query.where('id', '>', 1).select()
    for (const category of categories) {
      const permissions = this.groupPermissionModel.getCategoryPermissions(category)
      for (const permission of permissions) {
        await this.groupPermissionModel.query.where('group_id', permission.group_id)
          .andWhere('permission', permission.permission)
          .delete()
      }
    }
    return this.categoryModel.query.where('id', '>', 1).delete()
  }

  public async thread(): Promise<number> {
    await this.postModel.query.where('is_first', 1).delete()
    return this.threadModel.query.where('id', '>', 0).delete()
  }

  public async post(): Promise<number> {
    return this.postModel.query.where('is_first', 0).delete()
  }

  public async attachment(): Promise<number> {
    return this.attachmentModel.query.where('id', '>', 0).delete()
  }

  public async emoji(): Promise<number> {
    const imageTypes = await this.forumImagetypeModel.query.select()
    return this.emojiModel.query.whereIn('category', imageTypes.map((e) => e.directory))
  }
}
