import { loadContents } from 'complex-utils'
import { App } from 'vue'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/antd.less'
import { init as initBase } from './index'
// import { init as initImplement } from './src/antd/implement'

const antdContents = require.context('./src/antd/data', false, /(\.vue)|(\.jsx)$/)

export const init = function(app: App) {
  console.warn('稳定后改为按需加载！')
  app.use(Antd)
  initBase(app)
  // initImplement()
  loadContents(antdContents, function(item) {
    const data = item.default || item
    app.component(data.name, data)
  })
  return app
}
