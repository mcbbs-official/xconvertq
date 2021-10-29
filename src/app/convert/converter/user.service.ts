import {Injectable} from '@nestjs/common'
import {ConfigService} from '@nestjs/config'
import {asyncStreamConsumer} from 'async-stream-consumer'
import * as Logger from 'bunyan'
import {formatDistanceToNow, fromUnixTime} from 'date-fns'
import {zhCN} from 'date-fns/locale'
import {InjectLogger} from 'nestjs-bunyan'
import {IUserSchema, UserModel} from '../../models/q/user.model'
import {CommonMemberCountModel} from '../../models/x/common-member-count.model'
import {CommonMemberProfileModel} from '../../models/x/common-member-profile.model'
import {CommonMemberModel, ICommonMemberSchema} from '../../models/x/common-member.model'
import {UcenterMemberModel} from '../../models/x/ucenter-member.model'
import {BaseService} from '../base.service'

@Injectable()
export class UserService extends BaseService {
  @InjectLogger() logger: Logger

  private readonly usernameSet = new Set<string>()

  constructor(
    private readonly configService: ConfigService,
    private readonly commonMemberModel: CommonMemberModel,
    private readonly ucenterMemberModel: UcenterMemberModel,
    private readonly commonMemberCountModel: CommonMemberCountModel,
    private readonly commonMemberProfileModel: CommonMemberProfileModel,
    private readonly userModel: UserModel,
  ) {
    super()
  }

  public async execute() {
    const checkUser = await this.userModel.checkUsers()
    if (checkUser) {
      this.logger.error('Q用户表有除user_id = 1 之外的数据无法继续执行用户转换，请先删除再执行命令')
      return
    }

    const start = new Date()

    const query = this.commonMemberModel.query.where('uid', '>', 1)
    const count = await query.clone().count({count: '*'})


    const cursor = query.stream({highWaterMark: this.configService.get('HighWaterMark')})

    const bar = this.getBar('转换用户', count[0].count)

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
        thread_count: memberCount?.threads ?? 0,
        mobile: memberProfile?.mobile ?? '',
      }
      if (this.usernameSet.has(user.username)) {
        user.username = `${user.username}${this.rand()}`
      }
      queue.push(user)
      if (queue.length >= 1000 ) {
        await this.flush(queue, this.userModel)
      }
      bar.tick()
    })
    await this.flush(queue, this.userModel)
    bar.terminate()
    this.logger.info(`用户转换完成，耗时${formatDistanceToNow(start, {locale: zhCN})}`)

  }

  private discuzxAvatarPath(uid: number, size = 'big', type = ''): string {
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
