import bbob from '@bbob/core'
import {render} from '@bbob/html/es'
import html5Preset from '@bbob/preset-html5/es'
import * as TurndownService from 'turndown'
import {workerData} from 'worker_threads'

export interface IMessageData {
  message: string
  replyInfo: {
    pid: number
    username: string
  }
}

const turndownService = new TurndownService()

const convert = bbob(html5Preset())

export default function processMessage(message: string): IMessageData {
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
  message = convertMessage(message)
  return {
    message,
    replyInfo,
  }
}

export function convertMessage(message: string): string {
  const html = convert.process(message, {render}).html
  if (workerData.mode === 'markdown') {
    return turndownService.turndown(html)
  } else {
    return html
  }
}
