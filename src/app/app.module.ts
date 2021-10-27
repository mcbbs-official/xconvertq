import {Module} from '@nestjs/common'
import {ConfigModule, ConfigService} from '@nestjs/config'
import {BunyanLoggerModule} from 'nestjs-bunyan'
import {join} from 'path'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(__dirname, '../../.env'),
      load: [() => ({
        PROJECT_ROOT: join(__dirname, '../../'),
        APP_NAME: 'xconvertq',
      })],
    }),
    BunyanLoggerModule.forRootAsync({
      isGlobal: true,
      bunyan: {
        inject: [ConfigService],
        useFactory(configService: ConfigService) {
          return {
            name: 'xconvertq',
            level: configService.get('LOGLEVEL', 'trace'),
          }
        },
      },
    }),
  ]
})
export class AppModule {}
