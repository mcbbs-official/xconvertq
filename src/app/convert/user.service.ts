import {Injectable} from '@nestjs/common'
import {asyncStreamConsumer} from 'async-stream-consumer'
import * as Logger from 'bunyan'
import {fromUnixTime} from 'date-fns'
import {InjectLogger} from 'nestjs-bunyan'
import * as ProgressBar from 'progress'
import {IUserSchema, UserModel} from '../models/q/user.model'
import {CommonMemberCountModel} from '../models/x/common-member-count.model'
import {CommonMemberProfileModel} from '../models/x/common-member-profile.model'
import {CommonMemberModel, ICommonMemberSchema} from '../models/x/common-member.model'
import {UcenterMemberModel} from '../models/x/ucenter-member.model'

@Injectable()
export class UserService {
  @InjectLogger() logger: Logger

  private readonly usernameSet = new Set<string>()

  constructor(
    private readonly commonMemberModel: CommonMemberModel,
    private readonly ucenterMemberModel: UcenterMemberModel,
    private readonly commonMemberCountModel: CommonMemberCountModel,
    private readonly commonMemberProfileModel: CommonMemberProfileModel,
    private readonly userModel: UserModel,
  ) {}

  public async execute() {
    const checkUser = await this.userModel.checkUsers()
    if (checkUser) {
      this.logger.error('Q用户表有除user_id = 1 之外的数据无法继续执行用户转换，请先删除再执行命令')
      return
    }

    const query = this.commonMemberModel.query.where('uid', '>', 1)
    const count = await query.clone().count({count: '*'})


    const cursor = query.stream({highWaterMark: 100})

    const bar = new ProgressBar('[user] [:bar] :rate/rps :percent :etas', {
      total: count[0].count,
    })

    const creator = await this.userModel.getByPk(1)
    this.usernameSet.add(creator.username)

    const queue: IUserSchema[] = []
    await asyncStreamConsumer<ICommonMemberSchema>(cursor, 50, async (member) => {
      const ucMember = await this.ucenterMemberModel.getByPk(member.uid)
      if (!ucMember) {
        bar.tick()
        return
      }

      const memberCount = await this.commonMemberCountModel.getByPk(member.uid)
      const memberProfile = await this.commonMemberProfileModel.getByPk(member.uid)
      let avatar = ''
      if (member.avatarstatus) {
        avatar = this.discuzxAvatarPath(member.uid)
      }
      const date = fromUnixTime(ucMember.regdate)
      const user = {
        id: member.uid,
        username: ucMember.username,
        status: member.status,
        password: ucMember.password,
        avatar,
        register_ip: ucMember.regip,
        salt: ucMember.salt,
        updated_at: date,
        created_at: date,
        thread_count: memberCount.threads,
        mobile: memberProfile.mobile,
      }
      if (this.usernameSet.has(user.username)) {
        user.username = `${user.username}${this.rand()}`
      }
      queue.push(user)
      if (queue.length >= 1000 ) {
        const data = [...queue]
        queue.length = 0
        await this.userModel.insertMany(data)
      }
      bar.tick()
    })
  }

  public discuzxAvatarPath(uid: number, size = 'big', type = ''): string {
    size = ['big', 'middle', 'small'].includes(size) ? size : 'middle'
    const uidStr = uid.toString(10).padStart(9, '0')
    const dir = [uidStr.substr(0, 3), uidStr.substr(3, 2), uidStr.substr(5, 2)]
    const typeadd = type === 'real' ? '_real' : '';
    return `${dir.join('/')}/${uidStr.substr(-2)}${typeadd}_avatar_${size}.jpg`
  }

  private rand(): string {
    return (Math.random() * 8999999 + 1000000).toString()
  }
}
