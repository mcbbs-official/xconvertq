import {Module} from '@nestjs/common'
import {ConfigService} from '@nestjs/config'
import knex from 'knex'
import {QMysql, XMysql} from './models.constant'
import {GroupUserModel} from './q/group-user.model'
import {UserWalletModel} from './q/user-wallet.model'
import {UserModel} from './q/user.model'
import {CommonMemberCountModel} from './x/common-member-count.model'
import {CommonMemberProfileModel} from './x/common-member-profile.model'
import {CommonMemberModel} from './x/common-member.model'
import {UcenterMemberModel} from './x/ucenter-member.model'

const models = [
  CommonMemberModel,
  CommonMemberCountModel,
  CommonMemberProfileModel,
  UcenterMemberModel,

  UserModel,
  UserWalletModel,
  GroupUserModel,]

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
