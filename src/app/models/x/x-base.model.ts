import {Inject, Injectable} from '@nestjs/common'
import {ConfigService} from '@nestjs/config'
import * as DataLoader from 'dataloader'
import {Knex} from 'knex'
import {XMysql} from '../models.constant'

@Injectable()
export abstract class XBaseModel<T = unknown> {
  @Inject(XMysql) protected readonly knex: Knex
  @Inject() protected readonly configService: ConfigService

  protected constructor(
    private readonly _tableName: string,
    public readonly pk?: string,
  ) {}

  public get tableName(): string {
    return `${this.configService.get('X_PRE', '')}${this._tableName}`
  }

  get query(): Knex.QueryBuilder<T> {
    return this.knex(this.tableName)
  }

  public async getByPk(id: string | number): Promise<T> {
    return this.query.where(this.pk, id).first()
  }

  public getPkLoader(cache = false): DataLoader<string| number, T> {
    return new DataLoader<string | number, T>(async (ids) => {
      const rows = await this.query.whereIn(this.pk, ids)
      return (ids.map((id) => rows.find((row) => row[this.pk] === id)))
    }, {
      cache,
    })
  }

  public async insertMany(data: Array<Partial<T>>): Promise<void> {
    await this.query.insert(data as any)
  }
}
