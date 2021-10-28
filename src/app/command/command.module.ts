import {Module} from '@nestjs/common'
import {ConvertModule} from '../convert/convert.module'
import {CommandService} from './command.service'

@Module({
  imports: [
    ConvertModule,
  ],
  providers: [
    CommandService,
  ],
})
export class CommandModule {}
