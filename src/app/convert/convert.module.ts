import {Module} from '@nestjs/common'
import {ModelsModule} from '../models/models.module'
import {AttachmentService} from './attachment.service'
import {CategoryService} from './category.service'
import {ConvertService} from './convert.service'
import {UserService} from './user.service'

@Module({
  imports: [
    ModelsModule,
  ],
  providers: [
    ConvertService,
    UserService,
    CategoryService,
    AttachmentService,
  ],
  exports: [
    ConvertService,
  ],
})
export class ConvertModule {}
