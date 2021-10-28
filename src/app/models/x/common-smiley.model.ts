import {Injectable} from '@nestjs/common'
import {XBaseModel} from './x-base.model'

export interface ICommonSmileySchema {
  id: number
  typeid: number
  displayorder: number
  type: string
  code: string
  url: string
}

@Injectable()
export class CommonSmileyModel extends XBaseModel<ICommonSmileySchema> {
  constructor() {
    super('common_smiley', 'id')
  }
}
