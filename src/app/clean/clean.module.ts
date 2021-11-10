import {Module} from '@nestjs/common'
import {ModelsModule} from '../models/models.module'
import {CleanCommand} from './clean.command'
import {ConfirmQuestion} from './confirm.question'

@Module({
  imports: [
    ModelsModule,
  ],
  providers: [
    CleanCommand,
    ConfirmQuestion,
  ],
})
export class CleanModule {}
