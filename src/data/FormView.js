import _func from 'complex-func'
import moment from 'moment'
import PaginationView from './../mod/PaginationView'
import UploadFile from './../mod/UploadFile'
import config from './../config'

// 事件相关
class EventData {
  constructor () {
    this.data = {
    }
    this.on = {}
  }
  build(name, target, prop, list = []) {
    this.data[name] = list
    this.on[name] = (...args) => {
      target.$emit('event', prop, name, args)
      this.trigger(name, ...args)
      target.$emit('eventEnd', prop, name, args)
    }
  }
  add(name, target, prop, data, method = 'push') {
    if (!this.data[name]) {
      this.build(name, target, prop)
    }
    if (data) {
      this.data[name][method](data)
    }
  }
  trigger(name, ...args) {
    if (this.data[name]) {
      for (let n = 0; n < this.data[name].length; n++) {
        this.data[name][n](...args)
      }
    }
  }
  getData() {
    return this.on
  }
}

let showLogs = {
  init: false,
  model: false
}
// 函数列表
const funcList = {
  valueInit: function (itemOption, formData, prop) {
    if (showLogs.init) { console.log(itemOption, formData, prop) }
    itemOption.props.value = formData[prop]
  },
  checkInit: function (itemOption, formData, prop) {
    if (showLogs.init) { console.log(itemOption, formData, prop) }
    itemOption.props.checked = formData[prop]
  },
  input: function (formdata, prop, args) {
    if (showLogs.model) { console.log(formdata, prop, args) }
    formdata[prop] = args[0].target.value
  },
  select: function (formdata, prop, args) {
    if (showLogs.model) { console.log(formdata, prop, args) }
    formdata[prop] = args[0]
  },
  change: function (formdata, prop, args) {
    if (showLogs.model) { console.log(formdata, prop, args) }
    formdata[prop] = args[0]
  }
}
// moment兼容
function formatMoment(data, propList, formatList) {
  for (let n = 0; n < propList.length; n++) {
    let prop = propList[n]
    if (data[prop]) {
      let type = _func.getType(data[prop])
      if (type == 'array') {
        for (let i = 0; i < data[prop].length; i++) {
          data[prop][i] = formatMomentNext(data[prop][i], formatList[n])
        }
      } else {
        data[prop] = formatMomentNext(data[prop], formatList[n])
      }
    }
  }
}
function formatMomentNext(value, format) {
  if (value) {
    if (moment.isMoment(value)) {
      return value
    } else {
      return moment(value, format)
    }
  } else {
    return value
  }
}
// 类型格式化
let typeFormat = {
  base: {
    func: {
      init: funcList.valueInit,
      data: {
        change: funcList.change
      }
    },
    option: function(itemOption, item, payload) {
      return itemOption
    }
  },
  data: {
    ainput: {
      func: {
        data: {
          input: funcList.input
        }
      },
      option: function(itemOption, item, payload) {
        itemOption.props = {
          type: item.edit.option.type,
          allowClear: !item.edit.option.hideClear,
          maxLength: item.edit.option.maxLength,
          disabled: item.edit.disabled.getData(payload.type),
          placeholder: item.edit.placeholder.getData(payload.type)
        }
        typeFormat.buildFunc(this, itemOption, item, payload)
        itemOption = _func.mergeData(itemOption, item.edit.localOption.item)
        return itemOption
      }
    },
    ainputNumber: {
      func: {},
      option: function(itemOption, item, payload) {
        itemOption.props = {
          min: item.edit.option.min,
          max: item.edit.option.max,
          precision: item.edit.option.precision,
          step: item.edit.option.step,
          disabled: item.edit.disabled.getData(payload.type),
          placeholder: item.edit.placeholder.getData(payload.type)
        }
        typeFormat.buildFunc(this, itemOption, item, payload)
        itemOption = _func.mergeData(itemOption, item.edit.localOption.item)
        return itemOption
      }
    },
    aswitch: {
      func: {
        init: funcList.checkInit
      },
      option: function(itemOption, item, payload) {
        itemOption.props = {
          disabled: item.edit.disabled.getData(payload.type)
        }
        typeFormat.buildFunc(this, itemOption, item, payload)
        itemOption = _func.mergeData(itemOption, item.edit.localOption.item)
        return itemOption
      }
    },
    aselect: {
      func: {},
      option: function(itemOption, item, payload) {
        itemOption.props = {
          mode: item.edit.option.mode,
          showSearch: item.edit.option.search.show,
          showArrow: !item.edit.option.hideArrow,
          allowClear: !item.edit.option.hideClear,
          dropdownMatchSelectWidth: item.edit.option.autoWidth,
          notFoundContent: item.edit.option.noDataContent,
          filterOption: item.edit.option.filterOption,
          disabled: item.edit.disabled.getData(payload.type),
          placeholder: item.edit.placeholder.getData(payload.type)
        }
        typeFormat.buildFunc(this, itemOption, item, payload)
        itemOption = _func.mergeData(itemOption, item.edit.localOption.item)
        return itemOption
      }
    },
    adate: {
      func: {},
      option: function(itemOption, item, payload) {
        itemOption.props = {
          format: item.edit.option.format,
          showTime: item.edit.option.showTime,
          disabledDate: item.edit.option.disabledDate,
          disabledTime: item.edit.option.disabledTime,
          disabled: item.edit.disabled.getData(payload.type),
          placeholder: item.edit.placeholder.getData(payload.type)
        }
        typeFormat.buildFunc(this, itemOption, item, payload)
        itemOption = _func.mergeData(itemOption, item.edit.localOption.item)
        formatMoment(itemOption.props, ['value', 'defaultValue'], [itemOption.props.formatedit, itemOption.props.formatedit])
        if (itemOption.props.showTime) {
          formatMoment(itemOption.props.showTime, ['defaultValue', 'defaultOpenValue'], [itemOption.props.showTime.format, itemOption.props.showTime.format])
        }
        return itemOption
      }
    },
    adateRange: {
      func: {},
      option: function(itemOption, item, payload) {
        itemOption.props = {
          format: item.edit.option.format,
          showTime: item.edit.option.showTime,
          separator: item.edit.option.separator,
          disabledDate: item.edit.option.disabledDate,
          disabledTime: item.edit.option.disabledTime,
          disabled: item.edit.disabled.getData(payload.type),
          placeholder: item.edit.placeholder.getData(payload.type)
        }
        typeFormat.buildFunc(this, itemOption, item, payload)
        itemOption = _func.mergeData(itemOption, item.edit.localOption.item)
        formatMoment(itemOption.props, ['value', 'defaultValue'], [itemOption.props.formatedit, itemOption.props.formatedit])
        if (itemOption.props.showTime) {
          formatMoment(itemOption.props.showTime, ['defaultValue', 'defaultOpenValue'], [itemOption.props.showTime.format, itemOption.props.showTime.format])
        }
        return itemOption
      }
    },
    afile: {
      func: {},
      option: function(itemOption, item, payload) {
        let layout = item.edit.option.layout
        if (layout == 'auto') {
          if (this.layout == 'inline') {
            layout = 'end'
          } else {
            layout = 'bottom'
          }
        }
        itemOption.props = {
          accept: item.edit.option.accept,
          multiple: item.edit.option.multiple,
          multipleAppend: item.edit.option.multipleAppend,
          maxNum: item.edit.option.maxNum,
          minNum: item.edit.option.minNum,
          maxSize: item.edit.option.maxSize,
          upload: item.edit.option.upload,
          fileUpload: item.edit.option.fileUpload,
          layout: layout,
          disabled: item.edit.disabled.getData(payload.type),
          placeholder: item.edit.placeholder.getData(payload.type)
        }
        typeFormat.buildFunc(this, itemOption, item, payload)
        itemOption = _func.mergeData(itemOption, item.edit.localOption.item)
        return itemOption
      }
    },
    abutton: {
      func: {
        init: false,
        data: {}
      },
      option: function(itemOption, item, payload) {
        itemOption.props = {
          loading: item.edit.option.loading,
          type: item.edit.option.type,
          icon: item.edit.option.icon,
          disabled: item.edit.disabled.getData(payload.type),
          placeholder: item.edit.placeholder.getData(payload.type)
        }
        typeFormat.buildFunc(this, itemOption, item, payload)
        itemOption = _func.mergeData(itemOption, item.edit.localOption.item)
        return itemOption
      }
    },
    aslot: {
      func: {
        init: false,
        data: {}
      },
      option: function(itemOption, item, payload) {
        itemOption.props = {
          ...item.edit.option,
          disabled: item.edit.disabled.getData(payload.type)
        }
        typeFormat.buildFunc(this, itemOption, item, payload)
        itemOption = _func.mergeData(itemOption, item.edit.localOption.item)
        return itemOption
      }
    }
  }
}

typeFormat.init = function() {
  for (let n in this.data) {
    let item = this.data[n]
    if (!item.option) {
      item.option = this.base.option
    }
    if (!item.func) {
      item.func = {}
    }
    if (item.func.init === undefined) {
      item.func.init = this.base.func.init
    }
    if (!item.func.data) {
      item.func.data = {}
      for (let i in this.base.func.data) {
        item.func.data[i] = this.base.func.data[i]
      }
    }
  }
}

typeFormat.getFunc = function(type) {
  let typeName = 'a' + type
  if (this.data[typeName]) {
    return this.data[typeName].func
  } else {
    return this.base.func
  }
}
typeFormat.getData = function(type) {
  let typeName = 'a' + type
  if (this.data[typeName]) {
    return this.data[typeName]
  } else {
    return this.base
  }
}

typeFormat.buildFunc = function(typeData, itemOption, item, payload) {
  let formData = payload.formData
  let funcData = typeData.func
  if (funcData.init) {
    funcData.init(itemOption, formData, item.prop)
  }
  let onEvent = new EventData()
  // 加载双向绑定逻辑
  for (let funcName in funcData.data) {
    onEvent.add(funcName, payload.target, item.prop, function (...args) {
      funcData.data[funcName](formData, item.prop, args)
    })
  }
  // 加载单独设置的事件监控
  for (let funcName in item.edit.on) {
    onEvent.add(funcName, payload.target, item.prop, item.edit.on[funcName] ? function (...args) {
      args.push(payload)
      item.edit.on[funcName](...args)
    } : false)
  }
  // 添加可能存在的需要触发emit事件的函数
  if (item.edit.eventTriggerList) {
    for (let i in item.edit.eventTriggerList) {
      let funcName = item.edit.eventTriggerList[i]
      onEvent.add(funcName, payload.target, item.prop, false)
    }
  }
  // 加载需要的独立触发的规则检查
  if (item.edit.autoTrigger) {
    for (let i in item.edit.autoTrigger) {
      let funcName = item.edit.autoTrigger[i]
      onEvent.add(funcName, payload.target, item.prop, function () {
        payload.target.triggerRuleCheck(payload.prop)
      })
    }
  }
  itemOption.on = onEvent.getData()
}

typeFormat.init()

export default {
  name: 'FormView',
  props: {
    type: { // formType
      type: String,
      required: true
    },
    layout: { // 表单布局	'horizontal'|'vertical'|'inline'
      type: String,
      required: false,
      default: config.FormView.layout
    },
    labelAlign: { // label 标签的文本对齐方式
      type: String,
      required: false,
      default: config.FormView.right
    },
    checkOnRuleChange: { // 是否在 rules 属性改变后立即触发一次验证
      type: Boolean,
      required: false,
      default: config.FormView.checkOnRuleChange
    },
    checkOnInit: {
      type: Boolean,
      required: false,
      default: config.FormView.checkOnInit
    },
    clearCheckOnInit: {
      type: Boolean,
      required: false,
      default: config.FormView.clearCheckOnInit
    },
    form: {
      type: Object,
      required: true
    },
    formOption: {
      type: Object,
      required: false,
      default: null
    },
    mainlist: {
      type: Array,
      required: true
    },
    footMenuOption: {
      type: Object,
      required: false
    },
    footMenu: {
      type: Array,
      required: false
    }
  },
  data() {
    return {
    }
  },
  computed: {
    currentFormOption() {
      let defaultFormOption = {
        props: {
          model: this.form.data,
          layout: this.layout,
          labelAlign: this.labelAlign,
          validateOnRuleChange: this.checkOnRuleChange
        },
        ref: config.FormView.ref
      }
      let currentFormOption = _func.mergeData(defaultFormOption, this.formOption)
      return currentFormOption
    },
    currentFootMenuOption() {
      const defaultFootOption = {
        type: 'auto',
        data: 'props',
        style: 'auto',
        option: {}
      }
      let currentFootMenuOption = _func.mergeData(defaultFootOption, this.footMenuOption)
      if (currentFootMenuOption.type == 'auto') {
        currentFootMenuOption.type = this.layout == 'inline' ? 'single' : 'multiple'
      }
      if (!currentFootMenuOption.option.style && currentFootMenuOption.style == 'auto') {
        currentFootMenuOption.option.style = config.FormView.footMenu.mainStyle[currentFootMenuOption.type]
      }
      return currentFootMenuOption
    },
    currentFootMenu() {
      let currentFootMenuOption = this.currentFootMenuOption
      let currentFootMenu
      let menuList = this.footMenu
      if (menuList && menuList.length > 0) {
        let size = menuList.length
        let list = []
        for (let i = 0; i < size; i++) {
          let menuItem = menuList[i]
          const parentOption = menuItem.parentOption
          if (currentFootMenuOption.data == 'props') {
            // 传值不存在时说明此时使用简单数据传值，所有传值默认传递到props中=>
            menuItem = {
              props: {
                ...menuItem
              }
            }
          }
          if (!menuItem.style && currentFootMenuOption.style == 'auto') {
            menuItem.style = config.FormView.footMenu.style[currentFootMenuOption.type]
          }
          if (!menuItem.on) {
            menuItem.on = {
            }
          }
          if (!menuItem.on.click) {
            menuItem.on.click = () => {
              this.$emit('menu', menuItem.props.act, {
                form: this.form,
                formData: this.form.data,
                list: this.mainlist,
                type: this.type,
                target: this
              })
            }
          }
          if (currentFootMenuOption.type == 'single') {
            // 单独模式
            let button = this.$createElement('a-button', menuItem, [ menuItem.props.name ])
            list.push(this.$createElement('a-form-model-item', _func.mergeData(currentFootMenuOption.option, parentOption), [ button ]))
          } else {
            // 共享模式
            list.push(this.$createElement('a-button', menuItem, [ menuItem.props.name ]))
          }
        }
        if (currentFootMenuOption.type == 'single') {
          // 单独模式
          currentFootMenu = list
        } else {
          // 共享模式
          currentFootMenu = this.$createElement('a-form-model-item', currentFootMenuOption.option, list)
        }
      }
      return currentFootMenu
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.setFormRef(this.checkOnInit, this.clearCheckOnInit)
    })
  },
  methods: {
    // 设置form的ref
    setFormRef(check, clear) {
      this.form.ref = this.$refs[config.FormView.ref]
      if (check) {
        this.triggerRuleCheck()
      } else if (clear) {
        this.clearRuleCheck()
      }
    },
    // 清除指定检查
    clearRuleCheck(prop) {
      if (this.form.ref) {
        this.form.ref.clearValidate(prop)
      }
    },
    // 重置检查
    resetRuleCheck() {
      if (this.form.ref) {
        this.form.ref.resetFields()
      }
    },
    // 触发检查
    triggerRuleCheck(prop) {
      if (this.form.ref) {
        if (prop) {
          this.form.ref.validateField(prop)
        } else {
          this.form.ref.validate()
        }
      }
    },
    renderFormList() {
      const renderFormList = this.mainlist.map((item, index) => {
        return this.renderItem(item, index)
      })
      if (this.currentFootMenu) {
        renderFormList.push(this.currentFootMenu)
      }
      return renderFormList
    },
    // forviewItem模板
    renderItem(item, index) {
      let renderItem = null
      let payload = {
        form: this.form,
        formData: this.form.data,
        prop: item.prop,
        item: item,
        list: this.mainlist,
        type: this.type,
        index: index,
        target: this
      }
      let mainSlot = this.$scopedSlots[item.edit.slot.name]
      if (item.edit.slot.type != 'main') {
        let mainOption = {
          props: {
            prop: item.prop,
            label: item.label,
            colon: item.edit.colon,
            rules: item.edit.rules.getData(payload.type)
          }
        }
        if (this.layout != 'inline' && item.layout.type == 'grid') {
          if (_func.getType(item.layout.label) == 'object') {
            mainOption.props.labelCol = item.layout.label
          } else {
            mainOption.props.labelCol = {
              span: item.layout.label
            }
          }
          if (_func.getType(item.layout.content) == 'object') {
            mainOption.props.wrapperCol = item.layout.content
          } else {
            mainOption.props.wrapperCol = {
              span: item.layout.content
            }
          }
        }
        if (this.$scopedSlots[item.edit.slot.label]) {
          mainOption.props.label = this.$scopedSlots[item.edit.slot.label]({
            ...payload
          })
        }
        mainOption = _func.mergeData(mainOption, item.edit.localOption.main)
        renderItem = this.$createElement('a-form-model-item', mainOption, [ this.renderTip(item, mainSlot, payload) ])
      } else {
        if (mainSlot) {
          renderItem = mainSlot({
            ...payload
          })
        } else {
          console.error(`${item.prop}/${item.name}需要设置插槽!`)
        }
      }
      return renderItem
    },
    // tips模板
    renderTip(item, mainSlot, payload) {
      let typeItem = null
      if (mainSlot && (item.edit.slot.type == 'auto' || item.edit.slot.type == 'item')) {
        typeItem = mainSlot({
          ...payload
        })
      } else {
        typeItem = this.renderTypeItem(item, mainSlot, payload)
      }
      if (item.edit.tips.props.title) {
        return this.$createElement('a-tooltip', { ...item.edit.tips }, [ typeItem ])
      } else {
        return typeItem
      }
    },
    // typeItem宽度设置
    autoSetItemWidth(itemOption, width) {
      if (!itemOption.style) {
        itemOption.style = {}
      }
      if (!itemOption.style.width) {
        if (_func.getType(width) == 'number') {
          itemOption.style.width = width + 'px'
        } else if (width) {
          itemOption.style.width = width
        }
      }
    },
    // typeItem模板
    renderTypeItem(item, mainSlot, payload) {
      let tag
      let itemOption = {
        on: {}
      }
      let children
      let renderTypeItem = null
      let typeFormatData = typeFormat.getData(item.edit.type)
      itemOption = typeFormatData.option(itemOption, item, payload)
      if (item.layout.type == 'width') {
        this.autoSetItemWidth(itemOption, item.layout.width)
      } else if (item.edit.option.innerWidth) {
        this.autoSetItemWidth(itemOption, item.edit.option.innerWidth)
      }
      if (mainSlot && item.edit.slot.type == 'model') {
        renderTypeItem = mainSlot({
          ...payload,
          option: itemOption
        })
      } else if (item.edit.type == 'input') {
        tag = 'a-input'
      } else if (item.edit.type == 'inputNumber') {
        tag = 'a-input-number'
      } else if (item.edit.type == 'switch') {
        tag = 'a-switch'
      } else if (item.edit.type == 'select') {
        tag = 'a-select'
        let dict = {
          key: item.edit.option.optionValue || 'value',
          value: item.edit.option.optionValue || 'value',
          label: item.edit.option.optionLabel || 'label',
          disabled: item.edit.option.optionDisabled || 'disabled'
        }
        children = item.edit.option.list.map((itemData, indexData) => {
          let optionOption = {
            props: {
              key: itemData[dict.key],
              value: itemData[dict.value],
              disabled: itemData[dict.disabled] || false
            }
          }
          optionOption = _func.mergeData(optionOption, item.edit.localOption.option)
          return this.$createElement('a-select-option', optionOption, [ itemData[dict.label] ])
        })
        if (item.edit.pagination) {
          let paginationOption = {
            props: {
              data: item.edit.pagination,
              option: {
                props: {
                  simple: true
                }
              },
              mainOption: {
                props: {}
              }
            },
            on: {
              change: function (...args) {
                item.edit.func.page(...args)
              }
            }
          }
          paginationOption = _func.mergeData(paginationOption, item.edit.localOption.pagination)
          let paginationAreaOption = config.FormView.select.paginationAreaOption
          paginationAreaOption = _func.mergeData(paginationAreaOption, item.edit.localOption.paginationArea)
          let pagination = this.$createElement(PaginationView, paginationOption)
          itemOption.props.dropdownRender = (menuNode, props) => {
            return this.$createElement('div', [
              this.$createElement('div', [ menuNode ]),
              this.$createElement('div', paginationAreaOption, [ pagination ])
            ])
          }
        }
      } else if (item.edit.type == 'date') {
        tag = 'a-date-picker'
      } else if (item.edit.type == 'dateRange') {
        tag = 'a-range-picker'
      } else if (item.edit.type == 'file') {
        tag = UploadFile
      } else if (item.edit.type == 'button') {
        tag = 'a-button'
        children = [ item.edit.option.name.getData(payload.type) ]
      } else if (item.edit.type == 'slot') {
        console.error(`${item.prop}未定义slot`)
      }
      if (tag) {
        renderTypeItem = this.$createElement(tag, itemOption, children)
      }
      return renderTypeItem
    }
  },
  // 主模板
  render(h) {
    let renderFormList = this.renderFormList()
    let renderForm = h('a-form-model', this.currentFormOption, renderFormList)
    let render = h('div', {
      class: config.FormView.className
    }, [renderForm])
    return render
  }
}
