import {CommandFactory} from 'nest-commander'
import {AppModule} from './app/app.module'

export async function bootstrap(): Promise<void> {
  await CommandFactory.run(AppModule, ['warn', 'error'])
  process.exit(0)
}
