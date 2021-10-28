import {Module} from '@nestjs/common'
import {ConfigService} from '@nestjs/config'
import knex from 'knex'
import {QMysql, XMysql} from './models.constant'
import {CategoryModel} from './q/category.model'
import {GroupPermissionModel} from './q/group-permission.model'
import {GroupUserModel} from './q/group-user.model'
import {UserWalletModel} from './q/user-wallet.model'
import {UserModel} from './q/user.model'
import {CommonMemberCountModel} from './x/common-member-count.model'
import {CommonMemberProfileModel} from './x/common-member-profile.model'
import {CommonMemberModel} from './x/common-member.model'
import {ForumForumModel} from './x/forum-forum.model'
import {ForumForumfieldModel} from './x/forum-forumfield.model'
import {UcenterMemberModel} from './x/ucenter-member.model'

const models = [
  CommonMemberModel,
  CommonMemberCountModel,
  CommonMemberProfileModel,
  UcenterMemberModel,
  ForumForumModel,
  ForumForumfieldModel,

  UserModel,
  UserWalletModel,
  GroupUserModel,
  CategoryModel,
  GroupPermissionModel,
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
