import {resolve} from 'path'
import 'source-map-support/register'
import {bootstrap} from './index'

require('node-oom-heapdump')({
  path: resolve(__dirname, 'my_heapdump')
})

bootstrap()
.catch((err) => {
  console.error(err)
  process.exit(1)
})
