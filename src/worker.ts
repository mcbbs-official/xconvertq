import * as convert from 'bbcode-to-markdown'

export interface IMessageData {
  message: string,
  replyInfo: {
    pid: number
    username: string
  }
}

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
  message = convert(message)
  return {
    message,
    replyInfo,
  }
}
