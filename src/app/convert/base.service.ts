import * as ProgressBar from 'progress'
import {QBaseModel} from '../models/q/q-base.model'

export class BaseService {
  public getBar(name: string, total: number): ProgressBar {
    return new ProgressBar(`[${name}] [:bar] :rate/rps :percent :etas`, {
      total,
    })
  }

  public async flush(queue: unknown[], model: QBaseModel): Promise<void> {
    if (queue.length === 0) return
    const data = [...queue]
    queue.length = 0
    await model.insertMany(data)
  }
}
