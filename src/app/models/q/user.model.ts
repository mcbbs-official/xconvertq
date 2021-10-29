import {Injectable} from '@nestjs/common'
import * as DataLoader from 'dataloader'
import * as QuickLRU from 'quick-lru'
import {GroupUserModel} from './group-user.model'
import {QInitModel} from './q-base.model'
import {UserWalletModel} from './user-wallet.model'

export interface IUserSchema {
  id: number
  username: string
  password: string
  salt: string
  updated_at: Date
  mobile: string
  created_at: Date
  thread_count: number
  avatar: string
  register_ip: string
  status: number
}

@Injectable()
export class UserModel extends QInitModel<IUserSchema> {
  constructor(
    private readonly userWalletModel: UserWalletModel,
    private readonly groupUserModel: GroupUserModel,
  ) {
    super('users')
  }

  public async init(user: IUserSchema[]): Promise<void> {
    await this.insertMany(user)
    const userIds = user.map((e) => e.id)
    await this.userWalletModel.init(userIds)
    await this.groupUserModel.init(userIds)
  }

  public async checkUsers(): Promise<boolean> {
    return this.check()
  }

  public async getAllId(): Promise<Set<number>> {
    const userIds = await this.query.distinct('id')
    return new Set(userIds.map((e) => e.id))
  }

  public getUsernameLoader(): DataLoader<string, IUserSchema> {
    return new DataLoader<string, IUserSchema>(async (usernames) => {
      const users: IUserSchema[] = await this.query.whereIn('username', usernames)
      return usernames.map((e) => users.find((user) => user.username === e))
    }, {
      cacheMap: new QuickLRU({maxSize: 1e6}),
    })
  }
}
