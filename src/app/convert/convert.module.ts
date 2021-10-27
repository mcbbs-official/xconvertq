import {Module} from '@nestjs/common'
import {ModelsModule} from '../models/models.module'

@Module({
  imports: [
    ModelsModule,
  ]
})
export class ConvertModule {}
