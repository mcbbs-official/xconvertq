import 'source-map-support/register'
import {bootstrap} from './index'

bootstrap()
.catch((err) => {
  console.error(err)
  process.exit(1)
})
