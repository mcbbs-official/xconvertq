import {Injectable} from '@nestjs/common'
import {QInitModel} from './q-base.model'

export interface IAttachmentSchema {
  id: number
  uuid: string
  user_id: number
  type_id: number
  order: number
  type: number
  is_remote: number
  is_approved: number
  attachment: string
  file_path: string
  file_name: string
  file_size: number
  file_type: string
  ip: string
  created_at: Date
  updated_at: Date
}

@Injectable()
export class AttachmentModel extends QInitModel<IAttachmentSchema> {
  constructor() {
    super('attachments', 'id')
  }

  public async init(data: IAttachmentSchema[]): Promise<void> {
    await this.insertMany(data)
  }
}
