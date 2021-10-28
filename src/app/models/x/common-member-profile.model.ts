import {Injectable} from '@nestjs/common'
import {XBaseModel} from './x-base.model'

interface ICommonMemberProfileSchema {
  uid: number
  realname: string
  mobile: string
}

@Injectable()
export class CommonMemberProfileModel extends XBaseModel<ICommonMemberProfileSchema> {
  constructor() {
    super('common_member_profile', 'uid')
  }
}
