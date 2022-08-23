import $func from 'complex-func'
import { App } from 'vue'
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/antd.less';
import { init as initBase } from './index'

const antdContents = require.context('./src/antd/data', false, /(\.vue)|(\.jsx)$/)

export const init = function(app: App) {
  app.use(Antd)
  initBase(app)
  $func.loadContents(antdContents, function(item) {
    const data = item.default || item
    app.component(data.name, data)
  })
  return app
}
