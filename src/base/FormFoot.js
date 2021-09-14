import _func from 'complex-func'
import config from '../../config'
import utils from '../utils'

export default {
  name: 'FormFoot',
  props: {
    list: {
      type: Array,
      required: true
    },
    auto: {
      type: Object,
      required: true
    },
    form: { // form数据{ data, num }
      type: Object,
      required: true
    },
    type: { // formType
      type: String,
      required: true
    },
    layout: { // 表单布局	'horizontal'|'vertical'|'inline'
      type: String,
      required: true
    },
    target: { // FormView实例
      type: Object,
      required: true
    }
  },
  computed: {
    currentAuto() {
      let currentAuto = this._func.setDataByDefault(this.auto, config.FormView.auto)
      if (currentAuto.foot.type == 'auto') {
        currentAuto.foot.type = this.layout == 'inline' ? 'single' : 'multiple'
      }
      return currentAuto
    }
  },
  mounted() {
  },
  methods: {
    countClassName(...args) {
      return utils.countClass(config.FormView.className, 'foot', ...args)
    }
  },
  /**
   * 主要模板
   * @param {*} h createElement
   * @returns {VNode}
   */
  render(h) {
    let size = this.list.length
    let list = []
    for (let i = 0; i < size; i++) {
      let menuItem = this.list[i]
      const parentOption = menuItem.parentOption
      let mainSlot
      if (menuItem.slot) {
        mainSlot = this.target.$scopedSlots[menuItem.slot]
      }
      if (this.auto.data == 'props') {
        // 传值不存在时说明此时使用简单数据传值，所有传值默认传递到props中=>
        menuItem = {
          props: {
            ...menuItem
          }
        }
      }
      if (menuItem.props.loading === undefined && this.auto.loading !== undefined) {
        menuItem.props.loading = this.auto.loading
      }
      if (menuItem.props.disabled === undefined && this.auto.disabled !== undefined) {
        menuItem.props.disabled = this.auto.disabled
      }
      const itemClass = this.countClassName(this.auto.type, 'menu', 'item')
      utils.addClass(menuItem, itemClass)
      if (!menuItem.on) {
        menuItem.on = {}
      }
      if (!menuItem.on.click) {
        menuItem.on.click = () => {
          this.$emit('menu', menuItem.props.act, {
            form: this.form,
            formData: this.form.data,
            list: this.mainlist,
            type: this.type,
            target: this.target
          })
        }
      }
      if (this.auto.type == 'single') {
        // 单独模式
        let button
        if (!mainSlot) {
          button = h('a-button', menuItem, [ menuItem.props.name ])
        } else {
          button = mainSlot({
            data: menuItem,
            index: i
          })
        }
        let mainOption = _func.mergeData(this.auto.option, parentOption)
        const mainClass = this.countClassName(this.auto.type, 'menu')
        utils.addClass(mainOption, mainClass)
        list.push(h('a-form-model-item', mainOption, [ button ]))
      } else {
        // 共享模式
        let button
        if (!mainSlot) {
          button = h('a-button', menuItem, [ menuItem.props.name ])
        } else {
          button = mainSlot({
            data: menuItem,
            index: i
          })
        }
        list.push(button)
      }
    }
    let footMenu
    if (this.auto.type == 'single') {
      // 单独模式
      footMenu = list
    } else {
      // 共享模式
      let mainOption = this.auto.option
      const mainClass = this.countClassName(this.auto.type, 'menu')
      utils.addClass(mainOption, mainClass)
      footMenu = h('a-form-model-item', this.auto.option, list)
    }
    if (this.layout === 'inline') {
      return h('div', {
        class: this.countClassName(this.auto.type, 'menu', 'main')
      }, [
        footMenu
      ])
    } else {
      return h('a-col', this.auto.layout, [
        footMenu
      ])
    }
  }
}
