import Vue from 'vue'

// import FormView from './data/FormView'

const _mainviews = require.context('./data', false, /(\.vue)|(\.js)$/)
const _modviews = require.context('./mod', false, /(\.vue)|(\.js)$/)
function LoadViews (_views, mod = '') {
  let viewlist = _views.keys()
  viewlist.forEach(item => {
    let viewitem = _views(item)
    let viewdata = viewitem.default || viewitem
    Vue.component(`Local${mod}${viewdata.name}`, viewdata)
  })
}
// Vue.component(`LocalFormView`, FormView)

LoadViews(_mainviews)
LoadViews(_modviews, 'Mod')
