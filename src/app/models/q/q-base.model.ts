import {Inject, Injectable} from '@nestjs/common'
import {ConfigService} from '@nestjs/config'
import {Knex} from 'knex'
import {QMysql} from '../models.constant'

@Injectable()
export abstract class QBaseModel<T = unknown> {
  @Inject(QMysql) protected readonly table: Knex<T>
  @Inject() protected readonly configService: ConfigService

  protected constructor(
    private readonly _tableName: string,
    public readonly pk: string = 'id',
  ) {}

  public get tableName(): string {
    return `${this.configService.get('Q_PRE', '')}${this._tableName}`
  }

  get query(): Knex.QueryBuilder<T> {
    return this.table(this.tableName)
  }

  public async getByPk(id: string | number): Promise<T> {
    return this.query.where(this.pk, id).first()
  }

  public async insertMany(data: Array<Partial<T>>): Promise<void> {
    await this.query.insert(data as any)
  }
}

export abstract class QInitModel<T> extends QBaseModel<T> {
  public async check(): Promise<boolean> {
    return !!await this.query.where(this.pk, '>', 1).first()
  }

  public abstract init(data: T[]): Promise<void>
}
