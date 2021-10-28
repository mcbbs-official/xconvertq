import {Injectable} from '@nestjs/common'
import {GroupPermissionModel} from './group-permission.model'
import {QInitModel} from './q-base.model'

export interface ICategorySchema {
  id: number
  name: string
  description: string
  icon: string
  sort: number
  property: number
  thread_count: number
  moderators: string
  ip?: string
  parentid?: number
  created_at: Date
  updated_at: Date
}

@Injectable()
export class CategoryModel extends QInitModel<ICategorySchema> {
  constructor(
    private readonly groupPermissionModel: GroupPermissionModel,
  ) {
    super('categories', 'id')
  }

  public async checkCategory(): Promise<boolean> {
    return !!(await this.query.where('id', '>', 1).first())
  }

  public async init(data: ICategorySchema[]): Promise<void> {
    await this.insertMany(data)
    await this.groupPermissionModel.init(data)
  }
}
