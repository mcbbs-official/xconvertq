import {Module} from '@nestjs/common'
import {CommandRunnerModule} from 'nest-commander'
import {ModelsModule} from '../models/models.module'
import {CleanCommand} from './clean.command'
import {CleanService} from './clean.service'
import {ConfirmQuestion} from './confirm.question'

@Module({
  imports: [
    ModelsModule,
    CommandRunnerModule.forModule(CleanModule),
  ],
  providers: [
    CleanCommand,
    ConfirmQuestion,
    CleanService,
  ],
})
export class CleanModule {}
