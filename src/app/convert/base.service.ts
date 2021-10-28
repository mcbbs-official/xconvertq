import * as ProgressBar from 'progress'
import {QInitModel} from '../models/q/q-base.model'

export abstract class BaseService {
  public getBar(name: string, total: number): ProgressBar {
    return new ProgressBar(`[${name}] [:bar] :rate/rps :percent :etas`, {
      total,
    })
  }

  public async flush(queue: object[], model: QInitModel<object>): Promise<void> {
    if (queue.length === 0) return
    const data = [...queue]
    queue.length = 0
    await model.init(data)
  }

  public abstract execute(): Promise<void>
}
