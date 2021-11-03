import {Inject, OnModuleInit} from '@nestjs/common'
import {ConfigService} from '@nestjs/config'
import * as ProgressBar from 'progress'
import {QInitModel} from '../models/q/q-base.model'

export abstract class BaseService implements OnModuleInit {
  @Inject() protected configService: ConfigService

  protected highWaterMark: number
  protected batchSize: number
  protected concurrent: number = 50

  public onModuleInit(): void {
    this.highWaterMark = this.configService.get('HighWaterMark')
    this.batchSize = parseInt(this.configService.get('BATCH_SIZE', '1000'), 10)
  }

  public getBar(name: string, total: number): ProgressBar {
    return new ProgressBar(`[${name}] :current/:total [:bar] :rate/rps :percent :etas`, {
      total,
      width: 80,
    })
  }

  public async flush(queue: object[], model: QInitModel<object>): Promise<void> {
    if (queue.length === 0) return
    // const data = [...queue]
    queue.length = 0
    // await model.init(data)
  }

  public abstract execute(): Promise<void>
}
