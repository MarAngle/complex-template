import { loadContents } from 'complex-utils'
import { App } from 'vue'

const baseContents = require.context('./src/base/data', false, /(\.vue)|(\.jsx)$/)

export const init = function(app: App) {
  loadContents(baseContents, function(item) {
    const data = item.default || item
    app.component(data.name, data)
  })
  return app
}
