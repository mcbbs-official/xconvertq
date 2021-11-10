import {MessageFor, Question, QuestionSet} from 'nest-commander'

@QuestionSet({name: 'confirm'})
export class ConfirmQuestion {
  @Question({
    name: 'confirm',
  })
  public confirm(val: string): boolean {
    return val === 'yes i do'
  }

  @MessageFor({name: 'confirm'})
  public confirmMessage({taskNames}: {taskNames: string[]}): string {
    return `请确认要清理所有转换相关的数据？将清理${taskNames.join('、')}转换数据
如确认，请输入 'yes i do'
`
  }
}
