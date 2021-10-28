import {Injectable} from '@nestjs/common'
import {GroupUserModel} from './group-user.model'
import {QBaseModel} from './q-base.model'
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
export class UserModel extends QBaseModel<IUserSchema> {
  constructor(
    private readonly userWalletModel: UserWalletModel,
    private readonly groupUserModel: GroupUserModel,
  ) {
    super('users')
  }

  public async createUser(user: IUserSchema[]): Promise<void> {
    await this.insertMany(user)
    const userIds = user.map((e) => e.id)
    await this.userWalletModel.init(userIds)
    await this.groupUserModel.init(userIds)
  }

  public async checkUsers(): Promise<boolean> {
    return !!(await this.query.where('id', '>', 1).first())
  }
}
