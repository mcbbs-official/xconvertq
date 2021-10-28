import {NestFactory} from '@nestjs/core'
import {AppModule} from './app/app.module'
import {CommandService} from './app/command/command.service'

export async function bootstrap(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error'],
  })

  await app.init()

  const commandService = app.get(CommandService)
  await commandService.run()
}
