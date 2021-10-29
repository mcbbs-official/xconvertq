import {Injectable} from '@nestjs/common'
import {ICategorySchema} from './category.model'
import {QInitModel} from './q-base.model'

export interface IGroupPermission {
  group_id: number
  permission: string
}

@Injectable()
export class GroupPermissionModel extends QInitModel<object> {
  constructor() {
    super('group_permission', 'id')
  }

  public async init(categories: ICategorySchema[]) {
    const data = categories.map((e) => this.getCategoryPermissions(e)).flat()
    await this.query.insert(data).onConflict().ignore()
  }

  public getCategoryPermissions(category: ICategorySchema) {
    const prefix = `category${category.id}`
    return [
      {
        group_id: 7,
        permission: `${prefix}.viewThreads`,
      },
      {
        group_id: 10,
        permission: `${prefix}.createThread`,
      },
      {
        group_id: 10,
        permission: `${prefix}.replyThread`,
      },
      {
        group_id: 10,
        permission: `${prefix}.viewThreads`,
      },
    ]
  }
}
