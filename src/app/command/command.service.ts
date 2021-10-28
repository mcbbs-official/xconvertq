import {Injectable} from '@nestjs/common'
import * as yargs from 'yargs'
import {hideBin} from 'yargs/helpers'
import {ConvertService} from '../convert/convert.service'

@Injectable()
export class CommandService {
  private yargs = yargs(hideBin(process.argv))
    .command('convert', '转换', (yargs) => {
      return yargs.option('option', {
        array: true,
        default: ['all'],
        choices: ['all', 'user', 'category', 'thread', 'post', 'attachment', 'emoji', 'count'],
      })
    })
    .scriptName('xconvertq.js')
    .parse()

  constructor(
    private readonly convertService: ConvertService,
  ) {}

  public async run() {
    const args = await this.yargs
    await this.convertService.run(args.option)
  }
}
