import html5Preset from '@bbob/preset-html5/es'
import { render } from '@bbob/html/es'
import bbob from '@bbob/core'
import {workerData} from 'worker_threads'
import * as DrSax from 'dr-sax'

export interface IMessageData {
  message: string,
  replyInfo: {
    pid: number
    username: string
  }
}

let runs = 0

const drsax = new DrSax()

const convert = bbob(html5Preset())

export default function processMessage(message: string): IMessageData {
  runs ++
  if (runs % 10000 === 0) {
    // writeHeapSnapshot()
  }
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
  const html = convert.process(message, {render}).html
  if (workerData.mode === 'markdown') {
    message = drsax.write(html)
  } else {
    message = html
  }
  return {
    message,
    replyInfo,
  }
}

export function convertMessage(message): string {
  const html = convert.process(message, {render}).html
  if (workerData.mode === 'markdown') {
    return drsax.write(html)
  } else {
    return html
  }
}
