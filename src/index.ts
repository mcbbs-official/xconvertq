import {CommandFactory} from 'nest-commander'
import {AppModule} from './app/app.module'

export async function bootstrap(): Promise<void> {
  await CommandFactory.run(AppModule, {
    cliName: 'xconvertq.js',
    logger: ['warn', 'error'],
  })
  process.exit(0)
}
