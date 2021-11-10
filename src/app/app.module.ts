import {Module} from '@nestjs/common'
import {ConfigModule, ConfigService} from '@nestjs/config'
import {BunyanLoggerModule} from 'nestjs-bunyan'
import {join} from 'path'
import {cwd} from 'process'
import {ConvertModule} from './convert/convert.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(cwd(), '.env'),
      load: [() => ({
        PROJECT_ROOT: join(__dirname, '../../'),
        APP_NAME: 'xconvertq',
        HighWaterMark: 100,
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

    ConvertModule,
  ],
})
export class AppModule {}
