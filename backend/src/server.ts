import { env } from './configs/env.js'
import { createApp } from './app.js'

createApp().listen(env.port, () => {
  console.log(`Clinic AI Ops API running on http://localhost:${env.port}`)
})
