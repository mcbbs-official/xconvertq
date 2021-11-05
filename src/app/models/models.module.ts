import {Module} from '@nestjs/common'
import {ConfigService} from '@nestjs/config'
import knex from 'knex'
import {QMysql, XMysql} from './models.constant'
import {AttachmentModel} from './q/attachment.model'
import {CategoryModel} from './q/category.model'
import {EmojiModel} from './q/emoji.model'
import {GroupPermissionModel} from './q/group-permission.model'
import {GroupUserModel} from './q/group-user.model'
import {PostModel} from './q/post.model'
import {SettingModel} from './q/setting.model'
import {ThreadModel} from './q/thread.model'
import {UserWalletModel} from './q/user-wallet.model'
import {UserModel} from './q/user.model'
import {CommonMemberCountModel} from './x/common-member-count.model'
import {CommonMemberProfileModel} from './x/common-member-profile.model'
import {CommonMemberModel} from './x/common-member.model'
import {CommonSmileyModel} from './x/common-smiley.model'
import {ForumAttachmentModel} from './x/forum-attachment.model'
import {ForumForumModel} from './x/forum-forum.model'
import {ForumForumfieldModel} from './x/forum-forumfield.model'
import {ForumImagetypeModel} from './x/forum-imagetype.model'
import {ForumPostModel} from './x/forum-post.model'
import {ForumThreadModel} from './x/forum-thread.model'
import {UcenterMemberModel} from './x/ucenter-member.model'

const models = [
  CommonMemberModel,
  CommonMemberCountModel,
  CommonMemberProfileModel,
  UcenterMemberModel,
  ForumForumModel,
  ForumForumfieldModel,
  ForumAttachmentModel,
  CommonSmileyModel,
  ForumImagetypeModel,
  ForumPostModel,
  ForumThreadModel,

  UserModel,
  UserWalletModel,
  GroupUserModel,
  CategoryModel,
  GroupPermissionModel,
  AttachmentModel,
  EmojiModel,
  ThreadModel,
  PostModel,
  SettingModel,
]

@Module({
  providers: [
    {
      provide: XMysql,
      inject: [ConfigService],
      useFactory(configService: ConfigService) {
        return knex({
          client: 'mysql2',
          connection: configService.get('X_MYSQL'),
          pool: {
            max: 50,
          }
        })
      }
    },
    {
      provide: QMysql,
      inject: [ConfigService],
      useFactory(configService: ConfigService) {
        return knex({
          client: 'mysql2',
          connection: configService.get('Q_MYSQL'),
        })
      }
    },

    ...models,
  ],
  exports: [
    ...models,
  ]
})
export class ModelsModule {}
