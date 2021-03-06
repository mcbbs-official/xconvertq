import {toBoolean} from '@bangbang93/utils'
import {Inject, OnModuleInit} from '@nestjs/common'
import {ConfigService} from '@nestjs/config'
import {cpus} from 'os'
import * as ProgressBar from 'progress'
import {QInitModel} from '../models/q/q-base.model'
import ms = require('ms')
import Piscina = require('piscina')

let piscina: Piscina

export abstract class BaseService implements OnModuleInit {
  @Inject() protected configService: ConfigService

  protected highWaterMark: number
  protected batchSize: number
  protected concurrent: number = 50
  protected dryRun = false
  protected maxThreads = cpus().length

  public onModuleInit(): void {
    this.highWaterMark = this.configService.get('HighWaterMark')
    this.batchSize = parseInt(this.configService.get('BATCH_SIZE', '1000'), 10)
    this.maxThreads = parseInt(this.configService.get('MAX_THREAD', '0'), 10)
    if (isNaN(this.maxThreads) || this.maxThreads === 0) {
      this.maxThreads = cpus().length
    }
    this.concurrent = this.maxThreads * 20
    this.dryRun = toBoolean(this.configService.get('DRY_RUN', 'false'))
  }

  public getBar(name: string, total: number): ProgressBar {
    return new ProgressBar(`[${name}] :current/:total [:bar] :rate/rps :percent :etas`, {
      total,
      width: 80,
    })
  }

  public async flush(queue: unknown[], model: QInitModel<unknown>): Promise<void> {
    if (queue.length === 0) return
    const data = [...queue]
    queue.length = 0
    if (this.dryRun) return
    await model.init(data)
  }

  protected get piscina(): Piscina {
    if (piscina) {
      return piscina
    } else {
      piscina = new Piscina({
        filename: require.resolve('../../worker'),
        idleTimeout: ms('1h'),
        maxThreads: this.maxThreads,
        workerData: {
          mode: this.configService.get('CONVERT_MODE', 'html'),
        },
      })
      return piscina
    }
  }

  public abstract execute(): Promise<void>
}
