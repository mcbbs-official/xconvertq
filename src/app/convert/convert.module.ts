import {Module} from '@nestjs/common'
import {ModelsModule} from '../models/models.module'
import {AttachmentService} from './converter/attachment.service'
import {CategoryService} from './converter/category.service'
import {ConvertService} from './convert.service'
import {EmojiService} from './converter/emoji.service'
import {PostService} from './converter/post.service'
import {ThreadService} from './converter/thread.service'
import {UserService} from './converter/user.service'

@Module({
  imports: [
    ModelsModule,
  ],
  providers: [
    ConvertService,
    UserService,
    CategoryService,
    AttachmentService,
    EmojiService,
    ThreadService,
    PostService,
  ],
  exports: [
    ConvertService,
  ],
})
export class ConvertModule {}
