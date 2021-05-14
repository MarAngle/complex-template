import Vue from 'vue'

const _mainviews = require.context('./data', false, /(\.vue)|(\.js)$/)
const _modviews = require.context('./mod', false, /(\.vue)|(\.js)$/)
function LoadViews (_views, mod = '') {
  let viewlist = _views.keys()
  viewlist.forEach(item => {
    let viewitem = _views(item)
    let viewdata = viewitem.default || viewitem
    Vue.component(`Complex${mod}${viewdata.name}`, viewdata)
  })
}

LoadViews(_mainviews)
LoadViews(_modviews, 'Mod')
