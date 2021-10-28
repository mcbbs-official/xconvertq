import {Injectable} from '@nestjs/common'
import {CategoryService} from './category.service'

@Injectable()
export class ConvertService {
  constructor(
    private readonly categoryService: CategoryService,
  ) {}

  public async run(part: string[]): Promise<void> {
    await this.categoryService.execute()
  }
}
