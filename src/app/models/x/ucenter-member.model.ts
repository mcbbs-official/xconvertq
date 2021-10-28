import {Injectable} from '@nestjs/common'
import {XBaseModel} from './x-base.model'

interface IUcenterMemberSchema {
  uid: number
  username: string
  password: string
  salt: string
  email: string
  regip: string
  regdate: number
}

@Injectable()
export class UcenterMemberModel extends XBaseModel<IUcenterMemberSchema> {
  constructor() {
    super('ucenter_members', 'uid')
  }
}
