import bbob from '@bbob/core'
import {render} from '@bbob/html/es'
import html5Preset from '@bbob/preset-html5/es'
import {NestFactory} from '@nestjs/core'
import {isEmpty} from 'lodash'
import * as TurndownService from 'turndown'
import {AppModule} from './app/app.module'
import {MessageService} from './app/convert/message.service'
import Piscina = require('piscina')

export interface IMessageData {
  message: string
  replyInfo: {
    pid: number
    username: string
  }
}

const turndownService = new TurndownService()

const convert = bbob(html5Preset())

let messageService: MessageService

async function setupWorker(): Promise<typeof processMessage> {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error'],
  })
  await app.init()

  messageService = await app.get(MessageService)

  return processMessage
}

export default setupWorker()

export async function processMessage(message: string): Promise<IMessageData> {
  let replyInfo = null
  message = message.replace(/^\[quote]([\s\S]*?)\[\/quote]/, (_, matches) => {
    if (matches[0]) {
      const pid = /&pid=(\d+)&/.exec(matches[0])
      const username = /999999](.*)发表于/.exec(matches[0])
      if (pid?.[1] && username?.[1]) {
        replyInfo = {
          pid: parseInt(pid[1], 10),
          username: username[1],
        }
      }
    }
    return ''
  })
  message = await convertMessage(message)
  return {
    message,
    replyInfo,
  }
}

export async function convertMessage(message: string): Promise<string> {
  try {
    message = replaceFontFamily(message)
    message = await messageService.processMessage(message)
    const html = convert.process(message, {render}).html
    if (Piscina.workerData.mode === 'markdown') {
      return turndownService.turndown(html)
    } else {
      return html
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e, message)
    return message
  }
}

function replaceFontFamily(message: string): string {
  const fonts = {
    宋体: 'SimSun',
    新宋体: 'NSimSun',
    黑体: 'SimHei',
    微软雅黑体: 'Microsoft YaHei',
    微软雅黑: 'Microsoft YaHei',
    仿宋_GB2312: 'FangSong_GB2312',
    楷体_GB2312: 'KaiTi_GB2312',
  }
  return message.replace(/\[font=([\W\D\w\s]*?)\]([\W\D\w\s]*?)\[\/font\]/iug, (...matches) => {
    matches[1] = matches[1].replaceAll('&quot;', '').replaceAll(' ', '')
    if (isEmpty(matches[1])) {
      return matches[2]
    }
    if (fonts[matches[1]]) {
      return `[font=${fonts[matches[1]]}]${matches[2]}[/font]`
    } else {
      return `[font=${matches[1]}${matches[2]}[/font]`
    }
  })
}
