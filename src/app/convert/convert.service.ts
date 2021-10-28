import {Injectable} from '@nestjs/common'
import {UserService} from './user.service'

@Injectable()
export class ConvertService {
  constructor(
    private readonly userService: UserService,
  ) {}

  public async run(part: string[]): Promise<void> {
    await this.userService.execute()
  }
}
