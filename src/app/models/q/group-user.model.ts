import {Injectable} from '@nestjs/common'
import {QBaseModel} from './q-base.model'

interface IGroupUserSchema {
  group_id: number
  user_id: number
  expiration_time?: Date
}

@Injectable()
export class GroupUserModel extends QBaseModel<IGroupUserSchema> {
  constructor() {
    super('group_user')
  }

  public async init(userIds: number[], groupId = 10) {
    const groupUsers: IGroupUserSchema[] = userIds.map((e) => ({
      group_id: groupId,
      user_id: e,
    }))
    await this.insertMany(groupUsers)
  }
}
