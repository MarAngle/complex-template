import $func from 'complex-func'
import { App } from 'vue'
import { init as initBase } from './index'

const antdContents = require.context('./src/antd/data', false, /(\.vue)|(\.jsx)$/)

export const init = function(app: App) {
  initBase(app)
  $func.loadContents(antdContents, function(item) {
    const data = item.default || item
    app.component(`Complex${data.name}`, data)
  })
  return app
}
