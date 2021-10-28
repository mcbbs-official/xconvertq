import {Injectable} from '@nestjs/common'
import {XBaseModel} from './x-base.model'

interface ICommonMemberCountSchema {
  uid: number
  extcredits1: number
  extcredits2: number
  extcredits3: number
  extcredits4: number
  extcredits5: number
  extcredits6: number
  extcredits7: number
  extcredits8: number
  friends: number
  posts: number
  threads: number
  digestposts: number
  doings: number
  blogs: number
  albums: number
  sharings: number
  attachsize: number
  views: number
  oltime: number
  todayattachs: number
  todayattachsize: number
  feeds: number
  follower: number
  following: number
  newfollower: number
  blacklist: number
}

@Injectable()
export class CommonMemberCountModel extends XBaseModel<ICommonMemberCountSchema> {
  constructor() {
    super('common_member_count', 'uid')
  }
}
