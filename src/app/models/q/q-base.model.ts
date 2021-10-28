import {Inject, Injectable} from '@nestjs/common'
import {ConfigService} from '@nestjs/config'
import {Knex} from 'knex'
import {QMysql} from '../models.constant'

@Injectable()
export abstract class QBaseModel<T = unknown> {
  @Inject(QMysql) protected readonly table: Knex
  @Inject() private readonly configService: ConfigService

  protected constructor(
    private readonly _tableName: string,
    public readonly pk?: string,
  ) {}

  public get tableName(): string {
    return `${this.configService.get('Q_PRE', '')}${this._tableName}`
  }

  get query(): ReturnType<Knex['table']> {
    return this.table(this.tableName)
  }

  public async getByPk(id: string | number): Promise<T> {
    return this.query.where(this.pk, id).first()
  }

  public async insertMany(data: Partial<T>[]): Promise<void> {
    await this.query.insert(data)
  }
}
