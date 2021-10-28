import {Injectable} from '@nestjs/common'
import {AttachmentService} from './converter/attachment.service'
import {BaseService} from './base.service'
import {CategoryService} from './converter/category.service'
import {UserService} from './converter/user.service'

@Injectable()
export class ConvertService {
  public readonly parts: Record<string, BaseService>

  constructor(
    private readonly userService: UserService,
    private readonly categoryService: CategoryService,
    private readonly attachmentService: AttachmentService,
  ) {
    this.parts = {
      user: this.userService,
      category: this.categoryService,
      attachment: this.attachmentService,
    }
  }

  public async run(part: string[]): Promise<void> {
    await this.attachmentService.execute()
  }
}
