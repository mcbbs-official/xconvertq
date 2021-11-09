import {Injectable} from '@nestjs/common'
import {QBaseModel} from './q-base.model'

interface IUserWalletSchema {
  user_id: number
  available_amount: number
  freeze_amount: number
  wallet_status: number
  created_at: Date
  updated_at: Date
}

const date = new Date()

@Injectable()
export class UserWalletModel extends QBaseModel<IUserWalletSchema> {
  constructor() {
    super('user_wallets', 'user_id')
  }

  public async init(userIds: number[]) {
    const wallets: IUserWalletSchema[] = userIds.map((e) => ({
      user_id: e,
      available_amount: 0,
      freeze_amount: 0,
      wallet_status: 0,
      created_at: date,
      updated_at: date,
    }))
    await this.insertMany(wallets)
  }
}
