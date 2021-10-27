import {Module} from '@nestjs/common'
import {ConfigService} from '@nestjs/config'
import knex from 'knex'
import {QMysql, XMysql} from './models.constant'

@Module({
  providers: [
    {
      provide: XMysql,
      inject: [ConfigService],
      useFactory(configService: ConfigService) {
        return knex({
          dialect: 'mysql',
          connection: configService.get('X_MYSQL'),
        })
      }
    },
    {
      provide: QMysql,
      inject: [ConfigService],
      useFactory(configService: ConfigService) {
        return knex({
          dialect: 'mysql',
          connection: configService.get('Q_MYSQL'),
        })
      }
    },
  ]
})
export class ModelsModule {}
