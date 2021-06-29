import Vue from 'vue'
import _func from 'complex-func'

const contents = require.context('./data', false, /(\.vue)|(\.js)$/)
const modContents = require.context('./mod', false, /(\.vue)|(\.js)$/)

_func.LoadContents(contents, function(item) {
  let data = item.default || item
  Vue.component(`Complex${data.name}`, data)
})
_func.LoadContents(modContents, function(item) {
  let data = item.default || item
  Vue.component(`ComplexMod${data.name}`, data)
})
